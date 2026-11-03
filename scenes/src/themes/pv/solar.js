import { sunVector } from '../../core/geo.js';
import { pointInPolys, bboxOf } from '../../core/city.js';

// 光伏主题的世界模型：屋顶逐格日照遮挡与全天光伏潜力。

const HOURS = [];
for ( let h = 6; h <= 18.001; h += 0.5 ) HOURS.push( h );

// 把屋顶切成 cellSize 米的格子，逐格逐时刻用二维步进射线对全部楼体判断遮挡。
// 潜力 = 全天受照积分 / 无遮挡屋顶积分 × 300 kWh/m²·年（香港屋顶光伏的经验量级）。
export const POTENTIAL_REF = 300;
export async function computeRoofCells( campus, all, lat, cellSize = 5 ) {

	// 把全部楼体栅格化成 2.5 m 高度图，射线步进时直接查表
	const tStart = performance.now();
	const RES = 2.5;
	let gx0 = Infinity, gy0 = Infinity, gx1 = - Infinity, gy1 = - Infinity, maxTop = 0;
	const boxes = all.map( b => {

		const bb = bboxOf( b );
		gx0 = Math.min( gx0, bb[ 0 ] );
		gy0 = Math.min( gy0, bb[ 1 ] );
		gx1 = Math.max( gx1, bb[ 2 ] );
		gy1 = Math.max( gy1, bb[ 3 ] );
		maxTop = Math.max( maxTop, b.top );
		return bb;

	} );
	const NX = Math.ceil( ( gx1 - gx0 ) / RES ) + 1, NY = Math.ceil( ( gy1 - gy0 ) / RES ) + 1;
	const hmap = new Float32Array( NX * NY ).fill( - 1e4 );
	all.forEach( ( b, idx ) => {

		const [ minx, miny, maxx, maxy ] = boxes[ idx ];
		for ( let iy = Math.floor( ( miny - gy0 ) / RES ); iy <= Math.ceil( ( maxy - gy0 ) / RES ); iy ++ )
			for ( let ix = Math.floor( ( minx - gx0 ) / RES ); ix <= Math.ceil( ( maxx - gx0 ) / RES ); ix ++ ) {

				const k = iy * NX + ix;
				if ( hmap[ k ] >= b.top ) continue;
				if ( pointInPolys( gx0 + ix * RES, gy0 + iy * RES, b.polys ) ) hmap[ k ] = b.top;

			}

	} );
	const heightAt = ( x, y ) => {

		const ix = Math.round( ( x - gx0 ) / RES ), iy = Math.round( ( y - gy0 ) / RES );
		if ( ix < 0 || iy < 0 || ix >= NX || iy >= NY ) return - 1e4;
		return hmap[ iy * NX + ix ];

	};

	const sun = HOURS.map( h => sunVector( h, lat ) );
	const weight = sun.map( s => s.el > 0.02 ? Math.pow( Math.sin( s.el ), 1.1 ) : 0 );
	const refDaily = weight.reduce( ( a, v ) => a + v, 0 );
	const peak = Math.max( ...weight );

	const cells = [];
	campus.forEach( ( b, bi ) => {

		const [ minx, miny, maxx, maxy ] = bboxOf( b );
		const x0 = Math.floor( minx / cellSize ) * cellSize + cellSize / 2;
		const y0 = Math.floor( miny / cellSize ) * cellSize + cellSize / 2;
		for ( let x = x0; x < maxx; x += cellSize )
			for ( let y = y0; y < maxy; y += cellSize )
				if ( pointInPolys( x, y, b.polys ) ) cells.push( { x, z: - y, y: b.top + 0.8, bi, b } );

	} );

	let t0 = performance.now();
	for ( let k = 0; k < cells.length; k ++ ) {

		const c = cells[ k ], b = c.b, sx = c.x, sy = - c.z;
		const lit = new Float32Array( sun.length );
		let daily = 0;
		sun.forEach( ( s, j ) => {

			if ( ! weight[ j ] ) return;
			const dx = s.x, dy = - s.z, horiz = Math.hypot( dx, dy ), tanEl = Math.tan( s.el );
			for ( let d = 4; d < 360; d += 2.5 ) {

				const rayH = b.top + 0.5 + d * tanEl;
				if ( rayH > maxTop ) break;
				if ( heightAt( sx + dx / horiz * d, sy + dy / horiz * d ) > rayH ) return;

			}
			lit[ j ] = weight[ j ] / peak;
			daily += weight[ j ];

		} );
		c.lit = lit;
		c.potential = POTENTIAL_REF * daily / refDaily;
		delete c.b;
		// 分片计算，避免长时间阻塞主线程
		if ( performance.now() - t0 > 40 ) {

			await new Promise( r => setTimeout( r, 0 ) );
			t0 = performance.now();

		}

	}

	// 楼宇级汇总
	campus.forEach( b => {

		b.cellCount = 0;
		b.potential = 0;

	} );
	for ( const c of cells ) {

		campus[ c.bi ].cellCount ++;
		campus[ c.bi ].potential += c.potential;

	}
	campus.forEach( b => b.potential = b.cellCount ? b.potential / b.cellCount : 0 );

	console.info( `[scenes/pv] 屋顶日照：${cells.length} 格，${Math.round( performance.now() - tStart )} ms` );
	return { hours: HOURS, cells, cellSize };

}

// 某格在给定小时的瞬时受照（0..1，相对正午无遮挡）
export function cellIrradiance( solar, c, hour ) {

	const { hours } = solar;
	if ( hour <= hours[ 0 ] || hour >= hours[ hours.length - 1 ] ) return 0;
	const f = ( hour - hours[ 0 ] ) / 0.5;
	const k = Math.floor( f ), t = f - k;
	return c.lit[ k ] * ( 1 - t ) + c.lit[ Math.min( k + 1, c.lit.length - 1 ) ] * t;

}

// 屋顶逐格热力栅格：一格一个实例，颜色由主题每帧写入
export function makeRoofRaster( THREE, solar ) {

	const cellGeom = new THREE.PlaneGeometry( solar.cellSize * 0.84, solar.cellSize * 0.84 );
	cellGeom.rotateX( - Math.PI / 2 );
	const raster = new THREE.InstancedMesh( cellGeom, new THREE.MeshBasicMaterial( {
		transparent: true, opacity: 0, depthTest: false, depthWrite: false,
	} ), solar.cells.length );
	raster.renderOrder = 12;
	raster.frustumCulled = false;
	const m = new THREE.Matrix4();
	solar.cells.forEach( ( c, k ) => {

		raster.setMatrixAt( k, m.makeTranslation( c.x, c.y, c.z ) );
		raster.setColorAt( k, new THREE.Color( 0 ) );

	} );
	return raster;

}
