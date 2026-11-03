import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { patchReveal } from './reveal.js';

// 白模（建筑轮廓 + 高度）：读取 GeoJSON、挤出楼体、线框与屋顶面。与具体研究主题无关。

// 白模顶高与实景瓦片屋顶的射线实测中位差约 0.1 m（457 栋），两者高程基准一致，无需偏移。
export const HEIGHT_OFFSET = 0;

function ringsOf( geom ) {

	if ( geom.type === 'Polygon' ) return [ geom.coordinates ];
	if ( geom.type === 'MultiPolygon' ) return geom.coordinates;
	return [];

}

function pointInRing( x, y, ring ) {

	let inside = false;
	for ( let i = 0, j = ring.length - 1; i < ring.length; j = i ++ ) {

		const xi = ring[ i ][ 0 ], yi = ring[ i ][ 1 ], xj = ring[ j ][ 0 ], yj = ring[ j ][ 1 ];
		if ( ( yi > y ) !== ( yj > y ) && x < ( xj - xi ) * ( y - yi ) / ( yj - yi ) + xi ) inside = ! inside;

	}
	return inside;

}

export function pointInPolys( x, y, polys ) {

	for ( const rings of polys ) {

		if ( ! pointInRing( x, y, rings[ 0 ] ) ) continue;
		let hole = false;
		for ( let k = 1; k < rings.length; k ++ ) if ( pointInRing( x, y, rings[ k ] ) ) hole = true;
		if ( ! hole ) return true;

	}
	return false;

}

// 把一栋楼转成本地平面多边形：[[ [e, n], ... ], hole...]
function localPolys( feature, toLocal ) {

	return ringsOf( feature.geometry ).map( poly => poly.map( ring => {

		const pts = ring.map( ( [ lon, lat ] ) => {

			const p = toLocal( lat, lon, 0 );
			return [ p[ 0 ], - p[ 2 ] ];

		} );
		if ( pts.length > 1 ) {

			const a = pts[ 0 ], b = pts[ pts.length - 1 ];
			if ( a[ 0 ] === b[ 0 ] && a[ 1 ] === b[ 1 ] ) pts.pop();

		}
		return pts;

	} ) );

}

function shapesOf( polys ) {

	return polys.map( rings => {

		const shape = new THREE.Shape( rings[ 0 ].map( ( [ x, y ] ) => new THREE.Vector2( x, y ) ) );
		for ( let k = 1; k < rings.length; k ++ ) shape.holes.push( new THREE.Path( rings[ k ].map( ( [ x, y ] ) => new THREE.Vector2( x, y ) ) ) );
		return shape;

	} );

}

function extrude( polys, base, height ) {

	const g = new THREE.ExtrudeGeometry( shapesOf( polys ), { depth: Math.max( height, 1 ), bevelEnabled: false } );
	g.rotateX( - Math.PI / 2 );
	g.translate( 0, base, 0 );
	g.deleteAttribute( 'uv' );
	return g;

}

function roofOf( polys, top ) {

	const g = new THREE.ShapeGeometry( shapesOf( polys ) );
	g.rotateX( - Math.PI / 2 );
	g.translate( 0, top, 0 );
	g.deleteAttribute( 'uv' );
	g.deleteAttribute( 'normal' );
	return g;

}

export function polyArea( ring ) {

	let s = 0;
	for ( let i = 0, j = ring.length - 1; i < ring.length; j = i ++ ) s += ( ring[ j ][ 0 ] + ring[ i ][ 0 ] ) * ( ring[ j ][ 1 ] - ring[ i ][ 1 ] );
	return Math.abs( s / 2 );

}

function centroidOf( polys ) {

	let best = null, bestA = - 1;
	for ( const rings of polys ) {

		const a = polyArea( rings[ 0 ] );
		if ( a > bestA ) {

			bestA = a;
			best = rings[ 0 ];

		}

	}
	let x = 0, y = 0;
	for ( const p of best ) {

		x += p[ 0 ];
		y += p[ 1 ];

	}
	return [ x / best.length, y / best.length ];

}

export async function loadCity( dataBase, files, toLocal ) {

	// files: { campus, context }，相对数据目录的 GeoJSON 路径（见 places/*.js）
	const [ campusFC, contextFC ] = await Promise.all( [
		fetch( dataBase + files.campus ).then( r => r.json() ),
		fetch( dataBase + files.context ).then( r => r.json() ),
	] );

	const campusIds = new Set( campusFC.features.map( f => f.properties.GeoRefNo ) );
	const all = [];
	const addFeature = ( f, campus ) => {

		const p = f.properties;
		const base = ( p.BaseHeight ?? 0 ) + HEIGHT_OFFSET;
		const height = p.height ?? ( ( p.TopHeight ?? 0 ) - ( p.BaseHeight ?? 0 ) );
		if ( ! ( height > 0 ) ) return;
		const polys = localPolys( f, toLocal );
		if ( ! polys.length ) return;
		const area = polys.reduce( ( s, r ) => s + polyArea( r[ 0 ] ), 0 );
		all.push( {
			campus, polys, base, height, top: base + height, area,
			centroid: centroidOf( polys ),
			nameEN: p.BuildingNameEN || '', nameTC: p.BuildingNameTC || '',
		} );

	};
	campusFC.features.forEach( f => addFeature( f, true ) );
	contextFC.features.forEach( f => {

		if ( ! campusIds.has( f.properties.GeoRefNo ) ) addFeature( f, false );

	} );

	const campus = all.filter( b => b.campus );
	const context = all.filter( b => ! b.campus );

	// 场景中心 = 校园楼体面积加权中心
	let cx = 0, cy = 0, wa = 0;
	for ( const b of campus ) {

		cx += b.centroid[ 0 ] * b.area;
		cy += b.centroid[ 1 ] * b.area;
		wa += b.area;

	}
	const center = new THREE.Vector3( cx / wa, 0, - cy / wa );
	const bases = all.map( b => b.base ).sort( ( a, b ) => a - b );
	center.y = bases[ Math.floor( bases.length * 0.25 ) ];

	// ---------- 白模几何 ----------
	const group = new THREE.Group();

	const whiteMat = patchReveal( new THREE.MeshLambertMaterial( { color: 0xe4e9f0 } ), 'white' );
	const ctxMat = patchReveal( new THREE.MeshLambertMaterial( { color: 0xb9c3d1 } ), 'white' );

	const campusGeom = mergeGeometries( campus.map( b => extrude( b.polys, b.base, b.height ) ) );
	const contextGeom = mergeGeometries( context.map( b => extrude( b.polys, b.base, b.height ) ) );

	const campusMesh = new THREE.Mesh( campusGeom, whiteMat );
	const contextMesh = new THREE.Mesh( contextGeom, ctxMat );
	for ( const m of [ campusMesh, contextMesh ] ) {

		m.castShadow = true;
		m.receiveShadow = true;
		group.add( m );

	}

	// 世界模型：校园线框（透视叠加）
	const edges = new THREE.LineSegments(
		new THREE.EdgesGeometry( campusGeom, 25 ),
		new THREE.LineBasicMaterial( { color: 0x7fe9ff, transparent: true, opacity: 0, depthTest: false, depthWrite: false } ),
	);
	edges.renderOrder = 10;
	group.add( edges );

	// 屋顶面：合并成一个网格，逐楼写顶点颜色（主题可用作热力图衬底）
	const roofParts = campus.map( b => roofOf( b.polys, b.top + 0.6 ) );
	let offset = 0;
	campus.forEach( ( b, i ) => {

		b.roofRange = [ offset, roofParts[ i ].attributes.position.count ];
		offset += b.roofRange[ 1 ];

	} );
	const roofGeom = mergeGeometries( roofParts );
	roofGeom.setAttribute( 'color', new THREE.BufferAttribute( new Float32Array( offset * 3 ), 3 ) );
	const roofs = new THREE.Mesh( roofGeom, new THREE.MeshBasicMaterial( {
		vertexColors: true, transparent: true, opacity: 0, depthTest: false, depthWrite: false, side: THREE.DoubleSide,
	} ) );
	roofs.renderOrder = 11;
	group.add( roofs );

	// 屋顶底色：深色衬底，让栅格之间的缝读作"屋面"
	const rc = roofGeom.attributes.color;
	for ( let k = 0; k < rc.count; k ++ ) rc.setXYZ( k, 0.03, 0.08, 0.15 );

	return { group, campus, context, all, center, campusMesh, contextMesh, edges, roofs };

}

export function bboxOf( b ) {

	let minx = Infinity, miny = Infinity, maxx = - Infinity, maxy = - Infinity;
	for ( const rings of b.polys ) for ( const [ x, y ] of rings[ 0 ] ) {

		minx = Math.min( minx, x );
		maxx = Math.max( maxx, x );
		miny = Math.min( miny, y );
		maxy = Math.max( maxy, y );

	}
	return [ minx, miny, maxx, maxy ];

}
