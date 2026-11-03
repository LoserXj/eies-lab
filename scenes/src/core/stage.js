import * as THREE from 'three';
import { TilesRenderer } from '3d-tiles-renderer';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { makeFrame } from './geo.js';
import { reveal, patchReveal } from './reveal.js';
import { loadCity } from './city.js';
import { makeHud } from './hud.js';
import { LOOP_STEPS } from './timeline.js';

// 舞台：渲染器、相机、灯光、实景三维瓦片、白模城市、扫描几何。与研究主题无关，主题在 setup(ctx) 里往上加东西。
export async function createStage( { place, dataBase, hudMode, lang, shift = 0 } ) {

	const frame = makeFrame( place.origin.lat, place.origin.lon, 0 );

	// ---------------- 渲染器 / 场景 ----------------
	const BG = new THREE.Color( 0x070d18 );
	const renderer = new THREE.WebGLRenderer( { antialias: true, powerPreference: 'high-performance' } );
	renderer.setPixelRatio( Math.min( window.devicePixelRatio, 1.75 ) );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	document.getElementById( 'stage' ).appendChild( renderer.domElement );

	const scene = new THREE.Scene();
	scene.background = BG;
	scene.fog = new THREE.Fog( BG, 1400, 3400 );

	const camera = new THREE.PerspectiveCamera( 38, window.innerWidth / window.innerHeight, 5, 9000 );
	// 取景偏移：把画面主体推向右侧，给宿主页面左侧的文字让位
	const frameView = () => {

		const w = window.innerWidth, h = window.innerHeight;
		if ( shift > 0 ) camera.setViewOffset( w, h, - shift * w, 0, w, h );
		else camera.clearViewOffset();

	};
	frameView();

	const hemi = new THREE.HemisphereLight( 0xbcd4ff, 0x1a2233, 0.9 );
	scene.add( hemi );
	const sunLight = new THREE.DirectionalLight( 0xfff1d6, 1.6 );
	sunLight.castShadow = true;
	sunLight.shadow.mapSize.set( 2048, 2048 );
	Object.assign( sunLight.shadow.camera, { left: - 750, right: 750, top: 750, bottom: - 750, near: 10, far: 3000 } );
	sunLight.shadow.bias = - 0.0004;
	sunLight.shadow.normalBias = 1.2;
	scene.add( sunLight, sunLight.target );

	// ---------------- 实景三维瓦片 ----------------
	const tiles = new TilesRenderer( dataBase + place.files.tiles );
	const ktx = new KTX2Loader().setTranscoderPath( './basis/' ).detectSupport( renderer );
	// 瓦片里的 glTF 直接把图片声明为 image/ktx2（没有 KHR_texture_basisu 扩展），按 MIME 交给 KTX2Loader
	class KTX2MimePlugin {

		constructor( parser ) {

			this.parser = parser;
			this.name = 'KTX2_MIME';

		}

		loadTexture( index ) {

			const { json } = this.parser;
			const source = json.textures[ index ].source;
			if ( source === undefined || json.images[ source ].mimeType !== 'image/ktx2' ) return null;
			return this.parser.loadTextureImage( index, source, ktx );

		}

	}
	// 不用 GLTFExtensionsPlugin：它注册处理器时用了带 g 标志的正则，test() 会交替失败
	const gltfLoader = new GLTFLoader( tiles.manager ).setKTX2Loader( ktx );
	gltfLoader.register( parser => new KTX2MimePlugin( parser ) );
	tiles.manager.addHandler( /\.(gltf|glb)$/i, gltfLoader );
	tiles.errorTarget = 10;
	tiles.setCamera( camera );
	tiles.setResolutionFromRenderer( camera, renderer );
	tiles.group.matrixAutoUpdate = false;
	tiles.group.matrix.copy( frame.matrix );
	tiles.group.updateMatrixWorld( true );
	tiles.addEventListener( 'load-model', ( { scene: s } ) => {

		s.traverse( o => {

			if ( ! o.material ) return;
			( Array.isArray( o.material ) ? o.material : [ o.material ] ).forEach( m => patchReveal( m, 'real' ) );

		} );

	} );
	scene.add( tiles.group );

	// ---------------- 白模城市 ----------------
	const city = await loadCity( dataBase, place.files, frame.toLocal );
	scene.add( city.group );
	const C = city.center;
	sunLight.target.position.copy( C );

	// 地面 + 网格（只在未扫描区域可见）
	const ground = new THREE.Mesh( new THREE.CircleGeometry( 4200, 64 ), patchReveal( new THREE.MeshLambertMaterial( { color: 0x101a2b } ), 'white' ) );
	ground.rotation.x = - Math.PI / 2;
	ground.position.set( C.x, C.y - 0.3, C.z );
	ground.receiveShadow = true;
	scene.add( ground );
	const grid = new THREE.GridHelper( 6000, 150, 0x24405f, 0x172a42 );
	grid.material = patchReveal( new THREE.LineBasicMaterial( { color: 0x1f3754, transparent: true, opacity: 0.7 } ), 'white' );
	grid.position.set( C.x, C.y - 0.1, C.z );
	scene.add( grid );

	// 扫描几何：扫描线沿 DIR 推进，PERP 为横向
	const DIR = new THREE.Vector2( Math.cos( place.scanAngle ), - Math.sin( place.scanAngle ) ).normalize();
	const PERP = new THREE.Vector2( - DIR.y, DIR.x );
	reveal.uDir.value.copy( DIR );
	const ALONG0 = C.x * DIR.x + C.z * DIR.y;
	const pointOn = ( s, side, y ) => new THREE.Vector3(
		C.x + DIR.x * s + PERP.x * side, y, C.z + DIR.y * s + PERP.y * side );

	// ---------------- HUD ----------------
	const hud = makeHud( document.getElementById( 'hud' ), { lang, credit: place.credit } );
	const showHud = hudMode !== 'off';
	const _proj = new THREE.Vector3();
	function toScreen( v ) {

		_proj.copy( v ).project( camera );
		return { x: ( _proj.x * 0.5 + 0.5 ) * window.innerWidth, y: ( - _proj.y * 0.5 + 0.5 ) * window.innerHeight, front: _proj.z < 1 };

	}

	return {
		THREE, renderer, scene, camera, frameView, hemi, sunLight, tiles, city, C, frame, place, lang,
		reveal, DIR, PERP, ALONG0, pointOn, hud, showHud, toScreen,
	};

}

// 主循环：时间推进、定格、暂停、宿主消息。theme.update(loc, time) 每帧调用。
export function run( stage, timeline, theme, { act = null, speed = 1 } = {} ) {

	const { renderer, camera, frameView, tiles, hud, showHud } = stage;
	let fixed = act;
	let t = 0, time = 0, last = performance.now(), paused = false, raf = 0;

	const sceneTime = () => {

		if ( fixed === null || ! timeline.acts[ fixed ] ) return t;
		return timeline.starts[ fixed ] + ( t % timeline.acts[ fixed ].dur );

	};

	function frameLoop( now ) {

		const dt = Math.min( 0.1, ( now - last ) / 1000 );
		last = now;
		t += dt * speed;
		time += dt;
		const loc = timeline.locate( sceneTime() );
		theme.update( loc, time );
		if ( showHud ) {

			hud.setAct( loc.i, loc.act );
			hud.setProgress( LOOP_STEPS.findIndex( st => st.key === loc.act.step ), loc.p );

		}
		camera.updateMatrixWorld();
		tiles.update();
		renderer.render( stage.scene, camera );
		raf = requestAnimationFrame( frameLoop );

	}

	function setPaused( v ) {

		if ( v === paused ) return;
		paused = v;
		if ( paused ) cancelAnimationFrame( raf );
		else {

			last = performance.now();
			raf = requestAnimationFrame( frameLoop );

		}

	}

	raf = requestAnimationFrame( frameLoop );

	window.addEventListener( 'resize', () => {

		camera.aspect = window.innerWidth / window.innerHeight;
		frameView();
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
		tiles.setResolutionFromRenderer( camera, renderer );

	} );

	// 宿主页面消息：{ type: 'lab-scene', act?: 0..N | null, time?: 秒, paused?: bool }
	// 旧协议 { type: 'embodied-bg', scene } 仍然接受。
	window.addEventListener( 'message', ( e ) => {

		const d = e.data;
		if ( ! d || ( d.type !== 'lab-scene' && d.type !== 'embodied-bg' ) ) return;
		const a = 'act' in d ? d.act : d.scene;
		if ( 'act' in d || 'scene' in d ) {

			fixed = a === null ? null : Number( a );
			t = 0;

		}
		if ( typeof d.time === 'number' ) t = d.time;
		if ( typeof d.paused === 'boolean' ) setPaused( d.paused );

	} );

	return { setPaused, setTime: v => ( t = v ) };

}
