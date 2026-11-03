import * as THREE from 'three';
import { sunVector } from '../../core/geo.js';
import { makeTimeline, ramp, lerp, byAct, clamp01 } from '../../core/timeline.js';
import { makeDrone, makeScanFan, setFan, makeSparkles, makeSun, makeHub, makeFlows, updateFlows, GLOW } from '../../core/fx.js';
import { ACTS } from './acts.js';
import { computeRoofCells, cellIrradiance, makeRoofRaster } from './solar.js';
import { makePanels, updatePanels } from './panels.js';
import { makePvCards } from './cards.js';

// 光伏主题：无人机扫描感知 → 屋顶日照世界模型 → 一天的推演与选址 → 铺设光伏、能量流向电网 / 储能 → 预测与实测对照。
export default {
	key: 'pv',
	name: { en: 'Urban solar', zh: '城市光伏' },
	acts: ACTS,
	setup,
};

const { total: TOTAL } = makeTimeline( ACTS );

async function setup( ctx ) {

	const { renderer, scene, camera, hemi, sunLight, city, C, reveal, DIR, ALONG0, pointOn, hud, showHud, toScreen, place } = ctx;
	const LAT = place.origin.lat;

	// 世界模型：屋顶逐格日照（首次进入时计算，约 1 秒，分片执行不阻塞）
	const solar = await computeRoofCells( city.campus, city.all, LAT );
	const raster = makeRoofRaster( THREE, solar );
	city.group.add( raster );

	const SWEEP = 1000;
	const FLY_H = 190;
	// ---------------- 特效对象 ----------------
	const drone = makeDrone();
	scene.add( drone );
	drone.rotation.y = Math.atan2( - DIR.y, DIR.x );
	const fan = makeScanFan();
	scene.add( fan );
	const sparkles = makeSparkles();
	sparkles.material.uniforms.uDir.value.copy( DIR );
	sparkles.material.uniforms.uBaseY.value = C.y;
	sparkles.material.uniforms.uPx.value = renderer.getPixelRatio();
	scene.add( sparkles );
	const sunSprite = makeSun();
	scene.add( sunSprite );

	// 候选与选定屋顶：平均光伏潜力 × 面积
	const ranked = city.campus
		.map( ( b, i ) => ( { b, i, score: b.potential * Math.min( b.area, 4000 ) } ) )
		.filter( r => r.b.area > 500 && r.b.height > 10 && r.b.cellCount > 10 )
		.sort( ( a, b ) => b.score - a.score );
	const selected = ranked.slice( 0, 5 );
	const rankOf = new Map( selected.map( ( r, k ) => [ r.i, k ] ) );

	// 屋顶栅格：按扫描方向排序，世界模型幕里像"逐格计算"一样铺开
	const cells = solar.cells;
	{

		let lo = Infinity, hi = - Infinity;
		for ( const c of cells ) {

			c.order = c.x * DIR.x + c.z * DIR.y;
			lo = Math.min( lo, c.order );
			hi = Math.max( hi, c.order );

		}
		for ( const c of cells ) c.order = ( c.order - lo ) / ( hi - lo );

	}

	const panels = makePanels( selected.map( r => r.b ) );
	scene.add( panels );

	const hubGrid = makeHub( 0xffd36b );
	hubGrid.position.set( C.x + 470, C.y, C.z + 60 );
	const hubStore = makeHub( 0x8affc1 );
	hubStore.position.set( C.x - 420, C.y, C.z + 170 );
	scene.add( hubGrid, hubStore );

	const roofPoint = r => new THREE.Vector3( r.b.centroid[ 0 ], r.b.top + 2, - r.b.centroid[ 1 ] );
	const flowCurves = selected.map( ( r, k ) => {

		const a = roofPoint( r ), hub = ( k % 2 ? hubStore : hubGrid ).position.clone().setY( C.y + 8 );
		const mid = a.clone().lerp( hub, 0.5 );
		mid.y = Math.max( a.y, hub.y ) + 90;
		return new THREE.QuadraticBezierCurve3( a, mid, hub );

	} );
	const flows = makeFlows( flowCurves );
	flows.material.uniforms.uPx.value = renderer.getPixelRatio();
	scene.add( flows, flows.userData.lines );

	// 反馈回流：从电网沿弧线回到无人机起点
	const HOME = pointOn( - SWEEP * 0.72, 0, C.y + FLY_H );
	const backCurve = new THREE.CubicBezierCurve3(
		hubGrid.position.clone().setY( C.y + 20 ),
		hubGrid.position.clone().setY( C.y + 520 ),
		HOME.clone().setY( HOME.y + 420 ),
		HOME.clone(),
	);
	const comet = new THREE.Group();
	const COMET_N = 28;
	for ( let k = 0; k < COMET_N; k ++ ) {

		const s = new THREE.Sprite( new THREE.SpriteMaterial( { map: GLOW, color: 0x7fe9ff, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, transparent: true } ) );
		s.renderOrder = 15;
		comet.add( s );

	}
	scene.add( comet );

	// ---------------- HUD ----------------
		const cards = makePvCards( hud );
		// 楼名去掉冗长前缀，只留可读的短名
		const shortName = n => n.replace( /^The Hong Kong Polytechnic University\s*/i, 'PolyU ' ).replace( /\s+/g, ' ' ).trim();

		// ---------------- 每帧：所有参数由时间 t 决定 ----------------
	const roofColor = new THREE.Color();
	const WHITE = new THREE.Color( 1, 1, 1 );
	const RAMP = [ new THREE.Color( 0x1b3b8f ), new THREE.Color( 0x18b6d9 ), new THREE.Color( 0xffd166 ), new THREE.Color( 0xff5a36 ) ];
	function heatColor( v, out ) {

		v = clamp01( v ) * 3;
		const k = Math.min( 2, Math.floor( v ) );
		return out.copy( RAMP[ k ] ).lerp( RAMP[ k + 1 ], v - k );

	}

	function sunHour( loc ) {

		const { i, p } = loc;
		switch ( ACTS[ i ].key ) {

			case 'env': return lerp( 8, 11.5, ramp( p, 0.15, 1 ) );
			case 'perceive': return 11.5;
			case 'model': return lerp( 11.5, 12, p );
			case 'rollout':
				if ( p < 0.45 ) return lerp( 12, 18.2, p / 0.45 );
				if ( p < 0.55 ) return 19;
				return lerp( 5.8, 13, ( p - 0.55 ) / 0.45 );
			case 'act': return 13;
			default: return lerp( 13, 14.5, p );

		}

	}

	function update( loc, time ) {

		const t = loc.t;
		const act = loc.act.key;
		const { p } = loc;

		// 太阳
		const hour = sunHour( loc );
		const sv = sunVector( hour, LAT );
		const sunUp = clamp01( sv.y * 4 );
		sunLight.position.set( C.x + sv.x * 1500, C.y + Math.max( sv.y, 0.05 ) * 1500, C.z + sv.z * 1500 );
		sunLight.intensity = 0.25 + 1.45 * sunUp;
		hemi.intensity = 0.55 + 0.4 * sunUp;
		sunSprite.position.set( C.x + sv.x * 2600, C.y + sv.y * 2600, C.z + sv.z * 2600 );
		sunSprite.material.opacity = sunUp * byAct( loc, [ 1, 0.5, 0.35, 1, 0.5, 0.5 ] );

		// 扫描揭幕
		let s = 1e5, band = 0;
		if ( act === 'env' ) {

			const k = ramp( p, 0, 0.28 );
			s = k < 1 ? ALONG0 + lerp( SWEEP, - SWEEP, k ) : - 1e5;
			band = k < 1 ? 1 : 0;

		} else if ( act === 'perceive' ) {

			// 中段（校园所在）放慢，两端加快
			const u = clamp01( ( p - 0.06 ) / 0.84 ) * 2 - 1;
			s = ALONG0 + SWEEP * ( 0.55 * u + 0.45 * u * u * u );
			band = 1 - ramp( p, 0.88, 0.96 );

		}
		reveal.uScan.value = s;
		reveal.uBand.value = band;
		reveal.uDim.value = byAct( loc, [ 0, 0, 0.7, 0.72, 0.42, 0.45 ] );
		reveal.uDesat.value = byAct( loc, [ 0, 0, 0.85, 0.85, 0.5, 0.5 ] );

		// 无人机与扫描扇面
		const sLocal = s - ALONG0;
		let dPos = null, dVis = 0;
		if ( act === 'env' ) {

			dPos = pointOn( lerp( - SWEEP - 500, - SWEEP * 0.72, ramp( p, 0.3, 1 ) ), 0, C.y + FLY_H );
			dVis = ramp( p, 0.3, 0.6 );

		} else if ( act === 'perceive' ) {

			const k = clamp01( ( p - 0.06 ) / 0.84 );
			const sl = k <= 0 ? lerp( - SWEEP * 0.72, - SWEEP, ramp( p, 0, 0.06 ) ) : sLocal;
			dPos = pointOn( sl, Math.sin( p * Math.PI * 2 ) * 60, C.y + FLY_H );
			dVis = 1;

		} else if ( act === 'model' ) {

			dPos = pointOn( SWEEP + p * 600, 0, C.y + FLY_H + p * 200 );
			dVis = 1 - ramp( p, 0, 0.4 );

		} else if ( act === 'feedback' ) {

			dPos = HOME.clone();
			dVis = ramp( p, 0.88, 1 );

		}
		drone.visible = dVis > 0.01;
		if ( dPos ) {

			drone.position.copy( dPos );
			drone.position.y += Math.sin( time * 2.1 ) * 2;
			drone.scale.setScalar( 4 * dVis );
			drone.userData.rotors.forEach( ( r, k ) => r.rotation.z = time * 30 + k );

		}
		const fanOn = act === 'perceive' ? ramp( p, 0.04, 0.1 ) * ( 1 - ramp( p, 0.88, 0.94 ) ) : 0;
		fan.visible = fanOn > 0.01;
		if ( fan.visible ) {

			setFan( fan, drone.position, pointOn( sLocal, - 650, C.y ), pointOn( sLocal, 650, C.y ) );
			fan.material.uniforms.uOpacity.value = fanOn;
			fan.material.uniforms.uTime.value = time;

		}
		const sparkOn = Math.max( fanOn, act === 'env' ? band * 0.6 : 0 );
		sparkles.visible = sparkOn > 0.01;
		sparkles.material.uniforms.uOpacity.value = sparkOn;
		sparkles.material.uniforms.uScan.value = s;
		sparkles.material.uniforms.uTime.value = time;
		sparkles.material.uniforms.uDepth.value = act === 'env' ? - 70 : 70;

		// 世界模型：线框 + 屋顶逐格光伏潜力
		city.edges.material.opacity = byAct( loc, [ 0, 0, 0.55, 0.5, 0.22, 0.12 ] );
		const roofOn = byAct( loc, [ 0, 0, 1, 1, 0.12, 0.08 ] );
		city.roofs.material.opacity = roofOn * 0.85;
		city.roofs.visible = roofOn > 0.01;
		raster.material.opacity = roofOn * 0.92;
		raster.visible = roofOn > 0.01;
		if ( raster.visible ) {

			const instant = byAct( loc, [ 0, 0, 0, 1, 0, 0 ], 0.15 );
			const front = act === 'model' ? lerp( - 0.05, 1.08, ramp( p, 0.08, 0.75 ) ) : 2;
			const pulse = act === 'rollout' ? ramp( p, 0.6, 0.72 ) * ( 0.5 + 0.5 * Math.sin( time * 5 ) ) : 0;
			cells.forEach( ( c, k ) => {

				const vYear = ( c.potential - 100 ) / 200;
				const vNow = cellIrradiance( solar, c, hour );
				heatColor( lerp( vYear, vNow, instant ), roofColor );
				if ( front < 2 ) {

					const dd = front - c.order;
					if ( dd < 0 ) roofColor.setRGB( 0.03, 0.08, 0.15 );
					else if ( dd < 0.04 ) roofColor.lerp( WHITE, 1 - dd / 0.04 );

				}
				if ( pulse && rankOf.has( c.bi ) ) roofColor.lerp( WHITE, pulse * 0.45 );
				raster.setColorAt( k, roofColor );

			} );
			raster.instanceColor.needsUpdate = true;

		}

		// 光伏铺设
		updatePanels( panels, bi => {

			if ( act === 'act' ) return ramp( p, 0.05 + bi * 0.09, 0.5 + bi * 0.09 );
			if ( act === 'feedback' ) return 1;
			if ( act === 'env' ) return 1 - ramp( p, 0, 0.22 );
			return 0;

		} );
		panels.material.uniforms.uTime.value = time;

		// 能量枢纽与流动
		const hubOn = act === 'act' ? ramp( p, 0.3, 0.6 ) : act === 'feedback' ? 1 - ramp( p, 0.85, 1 ) : 0;
		for ( const h of [ hubGrid, hubStore ] ) {

			h.visible = hubOn > 0.01;
			h.userData.beam.material.opacity = 0.22 * hubOn;
			h.userData.ring.material.opacity = 0.7 * hubOn;
			h.userData.core.material.opacity = hubOn;
			h.userData.ring.scale.setScalar( 1 + 0.15 * Math.sin( time * 3 ) );

		}
		const flowOn = act === 'act' ? ramp( p, 0.45, 0.75 ) : act === 'feedback' ? 1 - ramp( p, 0.7, 0.9 ) : 0;
		flows.visible = flowOn > 0.01;
		flows.userData.lines.visible = flows.visible;
		if ( flows.visible ) updateFlows( flows, time, flowOn );

		// 反馈回流彗星
		const cu = act === 'feedback' ? ramp( p, 0.55, 0.92 ) : 0;
		comet.visible = cu > 0 && cu < 1;
		if ( comet.visible ) comet.children.forEach( ( sp, k ) => {

			const u = clamp01( cu - k * 0.012 );
			backCurve.getPoint( u, sp.position );
			sp.scale.setScalar( ( 70 - k * 2 ) );
			sp.material.opacity = ( 1 - k / COMET_N ) * 0.9;

		} );

		// 相机：缓慢摆动 + 每幕不同的距离 / 俯角 / 目标
		const az = - 2.2 + 0.5 * Math.sin( 2 * Math.PI * t / TOTAL ) + 0.04 * Math.sin( time * 0.13 );
		const dist = byAct( loc, [ 1250, 1500, 1050, 980, 760, 1100 ] );
		const elev = THREE.MathUtils.degToRad( byAct( loc, [ 33, 46, 56, 50, 40, 36 ] ) );
		const focus = selected.length ? roofPoint( selected[ 0 ] ) : C;
		const tk = byAct( loc, [ 0, 0, 0, 0.15, 0.45, 0.1 ] );
		const target = C.clone().lerp( focus.clone().setY( C.y ), tk );
		camera.position.set(
			target.x + Math.cos( az ) * Math.cos( elev ) * dist,
			target.y + Math.sin( elev ) * dist,
			target.z + Math.sin( az ) * Math.cos( elev ) * dist,
		);
		camera.lookAt( target );

		// HUD
		if ( showHud ) {

			const labelOn = act === 'rollout' ? ramp( p, 0.6, 0.75 ) : act === 'act' ? 1 : act === 'feedback' ? 1 - ramp( p, 0, 0.2 ) : 0;
			const items = [];
			selected.slice( 0, 3 ).forEach( ( r, k ) => {

				const sc = toScreen( roofPoint( r ).add( new THREE.Vector3( 0, 30, 0 ) ) );
				items.push( {
					id: 'b' + k, cls: 'roof', x: sc.x, y: sc.y, opacity: sc.front ? labelOn : 0,
					html: `<b>${shortName( r.b.nameEN )}</b>`,
				} );

			} );
			[ [ hubGrid, 'grid', 'Grid' ], [ hubStore, 'store', 'Storage' ] ].forEach( ( [ h, id, en ] ) => {

				const sc = toScreen( h.position.clone().setY( C.y + 170 ) );
				items.push( { id, cls: 'hub ' + id, x: sc.x, y: sc.y, opacity: sc.front ? hubOn : 0, html: `<b>${en}</b>` } );

			} );
			// 简单避让：与已放置标签过近时向上错开
			const placed = [];
			for ( const it of items ) {

				for ( let guard = 0; guard < 6; guard ++ ) {

					const hit = placed.find( q => Math.abs( q.x - it.x ) < 190 && Math.abs( q.y - it.y ) < 30 );
					if ( ! hit ) break;
					it.y = hit.y - 34;

				}
				if ( it.opacity > 0.01 ) placed.push( it );

			}
			hud.setLabels( items );
			const chartOn = act === 'feedback' ? ramp( p, 0.05, 0.2 ) * ( 1 - ramp( p, 0.9, 1 ) ) : 0;
			cards.drawChart( chartOn, ramp( p, 0.1, 0.6 ), ramp( p, 0.6, 0.85 ) );
			const legendOn = act === 'model' ? ramp( p, 0.15, 0.4 ) : act === 'rollout' ? 1 - ramp( p, 0.92, 1 ) : 0;
			cards.setLegend( legendOn, act === 'rollout' ? hour : null );

		}

	}

	return { update, selected };

}
