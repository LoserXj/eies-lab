import * as THREE from 'three';

// 通用特效：无人机感知、扫描扇面、点云、太阳、能量枢纽与能量流。各主题按需取用。

const additive = ( opts ) => new THREE.MeshBasicMaterial( {
	transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, ...opts,
} );

function glowTexture() {

	const c = document.createElement( 'canvas' );
	c.width = c.height = 128;
	const g = c.getContext( '2d' );
	const grd = g.createRadialGradient( 64, 64, 0, 64, 64, 64 );
	grd.addColorStop( 0, 'rgba(255,255,255,1)' );
	grd.addColorStop( 0.25, 'rgba(255,255,255,0.55)' );
	grd.addColorStop( 1, 'rgba(255,255,255,0)' );
	g.fillStyle = grd;
	g.fillRect( 0, 0, 128, 128 );
	const t = new THREE.CanvasTexture( c );
	t.colorSpace = THREE.SRGBColorSpace;
	return t;

}
export const GLOW = glowTexture();

// ---------------- 无人机 ----------------
export function makeDrone() {

	const drone = new THREE.Group();
	const dark = new THREE.MeshLambertMaterial( { color: 0x1b2433 } );
	const body = new THREE.Mesh( new THREE.BoxGeometry( 7, 2, 7 ), dark );
	drone.add( body );
	const rotors = [];
	for ( let i = 0; i < 4; i ++ ) {

		const a = Math.PI / 4 + i * Math.PI / 2;
		const arm = new THREE.Mesh( new THREE.BoxGeometry( 12, 0.8, 1 ), dark );
		arm.rotation.y = a;
		arm.position.set( Math.cos( a ) * 5, 0.4, - Math.sin( a ) * 5 );
		drone.add( arm );
		const rotor = new THREE.Mesh( new THREE.CircleGeometry( 4.2, 24 ), additive( { color: 0x9fdcff, opacity: 0.35, side: THREE.DoubleSide } ) );
		rotor.rotation.x = - Math.PI / 2;
		rotor.position.set( Math.cos( a ) * 10, 1.2, - Math.sin( a ) * 10 );
		drone.add( rotor );
		rotors.push( rotor );

	}
	const light = new THREE.Sprite( new THREE.SpriteMaterial( { map: GLOW, color: 0x7fe9ff, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true } ) );
	light.scale.setScalar( 70 );
	drone.add( light );
	drone.userData = { rotors, light };
	drone.scale.setScalar( 1.6 );
	return drone;

}

// ---------------- 扫描"画布"：从无人机向地面展开的扇面 ----------------
export function makeScanFan() {

	const geom = new THREE.BufferGeometry();
	geom.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array( 9 ), 3 ) );
	geom.setAttribute( 'uv', new THREE.BufferAttribute( new Float32Array( [ 0.5, 1, 0, 0, 1, 0 ] ), 2 ) );
	const mat = new THREE.ShaderMaterial( {
		transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
		uniforms: { uTime: { value: 0 }, uOpacity: { value: 0 }, uColor: { value: new THREE.Color( 0x7fe9ff ) } },
		vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
		fragmentShader: /* glsl */`
			varying vec2 vUv; uniform float uTime; uniform float uOpacity; uniform vec3 uColor;
			void main(){
				float lines = smoothstep(0.92, 1.0, fract(vUv.y * 26.0 - uTime * 1.6));
				float cols = smoothstep(0.96, 1.0, fract(vUv.x * 40.0));
				float a = (0.16 + 0.7 * lines + 0.3 * cols) * (1.0 - vUv.y * 0.75);
				gl_FragColor = vec4(uColor * a * uOpacity, 1.0);
			}`,
	} );
	const mesh = new THREE.Mesh( geom, mat );
	mesh.frustumCulled = false;
	mesh.renderOrder = 5;
	return mesh;

}

export function setFan( fan, apex, a, b ) {

	const p = fan.geometry.attributes.position;
	p.setXYZ( 0, apex.x, apex.y, apex.z );
	p.setXYZ( 1, a.x, a.y, a.z );
	p.setXYZ( 2, b.x, b.y, b.z );
	p.needsUpdate = true;

}

// ---------------- 扫描线上的点云闪光 ----------------
export function makeSparkles( count = 2600 ) {

	const pos = new Float32Array( count * 3 ), seed = new Float32Array( count );
	for ( let i = 0; i < count; i ++ ) {

		pos[ i * 3 ] = ( Math.random() - 0.5 ) * 2; // 横向（−1..1，乘半宽）
		pos[ i * 3 + 1 ] = Math.pow( Math.random(), 2.2 ); // 高度比例
		pos[ i * 3 + 2 ] = - Math.random(); // 扫描线后方（0..−1，乘深度）
		seed[ i ] = Math.random();

	}
	const geom = new THREE.BufferGeometry();
	geom.setAttribute( 'position', new THREE.BufferAttribute( pos, 3 ) );
	geom.setAttribute( 'seed', new THREE.BufferAttribute( seed, 1 ) );
	const mat = new THREE.ShaderMaterial( {
		transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
		uniforms: {
			uTime: { value: 0 }, uOpacity: { value: 0 }, uHalfWidth: { value: 900 }, uDepth: { value: 70 }, uHeight: { value: 70 },
			uScan: { value: 0 }, uDir: { value: new THREE.Vector2( 1, 0 ) }, uBaseY: { value: 0 }, uPx: { value: 1 },
		},
		vertexShader: /* glsl */`
			attribute float seed; varying float vA;
			uniform float uTime, uHalfWidth, uDepth, uHeight, uScan, uBaseY, uPx; uniform vec2 uDir;
			void main(){
				vec2 perp = vec2(-uDir.y, uDir.x);
				float along = uScan + position.z * uDepth;
				vec2 xz = uDir * along + perp * position.x * uHalfWidth;
				vec3 p = vec3(xz.x, uBaseY + position.y * uHeight, xz.y);
				vec4 mv = modelViewMatrix * vec4(p, 1.0);
				gl_Position = projectionMatrix * mv;
				float flick = 0.5 + 0.5 * sin(uTime * 9.0 + seed * 40.0);
				vA = flick * (1.0 + position.z) * (1.0 - position.y * 0.7);
				gl_PointSize = uPx * (2.0 + 3.0 * seed) * (300.0 / -mv.z);
			}`,
		fragmentShader: /* glsl */`
			varying float vA; uniform float uOpacity;
			void main(){ float d = length(gl_PointCoord - 0.5); if (d > 0.5) discard;
				gl_FragColor = vec4(vec3(0.55, 0.95, 1.0) * vA * uOpacity * (1.0 - d * 2.0), 1.0); }`,
	} );
	const pts = new THREE.Points( geom, mat );
	pts.frustumCulled = false;
	pts.renderOrder = 6;
	return pts;

}

// ---------------- 太阳 ----------------
export function makeSun() {

	const s = new THREE.Sprite( new THREE.SpriteMaterial( {
		map: GLOW, color: 0xffd27a, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false,
	} ) );
	s.scale.setScalar( 260 );
	return s;

}

// ---------------- 能量枢纽（电网 / 储能）与能量流 ----------------
export function makeHub( color ) {

	const g = new THREE.Group();
	const beam = new THREE.Mesh( new THREE.CylinderGeometry( 3, 9, 160, 24, 1, true ), additive( { color, opacity: 0.25, side: THREE.DoubleSide } ) );
	beam.position.y = 80;
	g.add( beam );
	const ring = new THREE.Mesh( new THREE.RingGeometry( 14, 18, 48 ), additive( { color, opacity: 0.7, side: THREE.DoubleSide } ) );
	ring.rotation.x = - Math.PI / 2;
	ring.position.y = 1;
	g.add( ring );
	const core = new THREE.Sprite( new THREE.SpriteMaterial( { map: GLOW, color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true } ) );
	core.scale.setScalar( 60 );
	core.position.y = 6;
	g.add( core );
	g.userData = { beam, ring, core };
	return g;

}

export function makeFlows( curves, perCurve = 36 ) {

	const n = curves.length * perCurve;
	const geom = new THREE.BufferGeometry();
	geom.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array( n * 3 ), 3 ) );
	geom.setAttribute( 'alpha', new THREE.BufferAttribute( new Float32Array( n ), 1 ) );
	const mat = new THREE.ShaderMaterial( {
		transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
		uniforms: { uColor: { value: new THREE.Color( 0xffd36b ) }, uPx: { value: 1 } },
		vertexShader: /* glsl */`
			attribute float alpha; varying float vA; uniform float uPx;
			void main(){ vA = alpha; vec4 mv = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix * mv;
				gl_PointSize = uPx * 7.0 * (400.0 / -mv.z); }`,
		fragmentShader: /* glsl */`
			varying float vA; uniform vec3 uColor;
			void main(){ float d = length(gl_PointCoord - 0.5); if (d > 0.5) discard;
				gl_FragColor = vec4(uColor * vA * pow(1.0 - d * 2.0, 1.5), 1.0); }`,
	} );
	const pts = new THREE.Points( geom, mat );
	pts.frustumCulled = false;
	pts.renderOrder = 14;
	pts.userData = { curves, perCurve };

	// 引导线
	const lineMat = new THREE.LineBasicMaterial( { color: 0xffd36b, transparent: true, opacity: 0, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending } );
	const lines = new THREE.Group();
	curves.forEach( c => {

		const l = new THREE.Line( new THREE.BufferGeometry().setFromPoints( c.getPoints( 60 ) ), lineMat );
		l.renderOrder = 13;
		lines.add( l );

	} );
	pts.userData.lines = lines;
	pts.userData.lineMat = lineMat;
	return pts;

}

const _v = new THREE.Vector3();
export function updateFlows( pts, time, strength ) {

	const { curves, perCurve } = pts.userData;
	const pos = pts.geometry.attributes.position, al = pts.geometry.attributes.alpha;
	curves.forEach( ( c, ci ) => {

		for ( let k = 0; k < perCurve; k ++ ) {

			const i = ci * perCurve + k;
			const u = ( k / perCurve + time * 0.22 + ci * 0.13 ) % 1;
			c.getPoint( u, _v );
			pos.setXYZ( i, _v.x, _v.y, _v.z );
			al.setX( i, strength * Math.sin( u * Math.PI ) );

		}

	} );
	pos.needsUpdate = true;
	al.needsUpdate = true;
	pts.userData.lineMat.opacity = strength * 0.35;

}
