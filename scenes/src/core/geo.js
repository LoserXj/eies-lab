import { Matrix4 } from 'three';

// WGS84 → 本地坐标。three.js 坐标约定：x = 东，y = 上，z = −北。
const A = 6378137;
const F = 1 / 298.257223563;
const E2 = F * ( 2 - F );
const RAD = Math.PI / 180;

export function ecef( latDeg, lonDeg, h ) {

	const p = latDeg * RAD, l = lonDeg * RAD;
	const sp = Math.sin( p ), cp = Math.cos( p );
	const N = A / Math.sqrt( 1 - E2 * sp * sp );
	return [ ( N + h ) * cp * Math.cos( l ), ( N + h ) * cp * Math.sin( l ), ( N * ( 1 - E2 ) + h ) * sp ];

}

export function makeFrame( lat0, lon0, h0 = 0 ) {

	const p = lat0 * RAD, l = lon0 * RAD;
	const sp = Math.sin( p ), cp = Math.cos( p ), sl = Math.sin( l ), cl = Math.cos( l );
	const o = ecef( lat0, lon0, h0 );
	const east = [ - sl, cl, 0 ];
	const north = [ - sp * cl, - sp * sl, cp ];
	const up = [ cp * cl, cp * sl, sp ];
	const dot = ( a, b ) => a[ 0 ] * b[ 0 ] + a[ 1 ] * b[ 1 ] + a[ 2 ] * b[ 2 ];

	// ECEF → 本地（float64 计算，避免 GPU float32 精度抖动）
	function toLocal( latDeg, lonDeg, h ) {

		const q = ecef( latDeg, lonDeg, h );
		const d = [ q[ 0 ] - o[ 0 ], q[ 1 ] - o[ 1 ], q[ 2 ] - o[ 2 ] ];
		return [ dot( d, east ), dot( d, up ), - dot( d, north ) ];

	}

	// 给 3D Tiles 根节点用的矩阵：行 = east / up / −north
	const matrix = new Matrix4().set(
		east[ 0 ], east[ 1 ], east[ 2 ], - dot( east, o ),
		up[ 0 ], up[ 1 ], up[ 2 ], - dot( up, o ),
		- north[ 0 ], - north[ 1 ], - north[ 2 ], dot( north, o ),
		0, 0, 0, 1,
	);

	return { toLocal, matrix };

}

// 太阳位置（简化公式），返回本地坐标下指向太阳的单位向量与高度角
export function sunVector( hour, latDeg, declDeg = - 14 ) {

	const p = latDeg * RAD, d = declDeg * RAD, H = ( hour - 12 ) * 15 * RAD;
	const el = Math.asin( Math.sin( p ) * Math.sin( d ) + Math.cos( p ) * Math.cos( d ) * Math.cos( H ) );
	// 从正南起算、向西为正的方位角
	const azS = Math.atan2( Math.sin( H ), Math.cos( H ) * Math.sin( p ) - Math.tan( d ) * Math.cos( p ) );
	const ce = Math.cos( el );
	const e = - Math.sin( azS ) * ce, n = - Math.cos( azS ) * ce, u = Math.sin( el );
	return { x: e, y: u, z: - n, el };

}
