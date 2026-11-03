import * as THREE from 'three';
import { pointInPolys } from '../../core/city.js';

// ---------------- 光伏阵列：东西向整排组串，由南往北逐排铺设 ----------------
const PANEL_D = 1.6, ROW_PITCH = 2.5, INSET = 2.2, STEP = 0.5;
export function makePanels( buildings ) {

	const strips = [];
	buildings.forEach( ( b, bi ) => {

		let minx = Infinity, miny = Infinity, maxx = - Infinity, maxy = - Infinity;
		for ( const [ x, y ] of b.polys[ 0 ][ 0 ] ) {

			minx = Math.min( minx, x );
			maxx = Math.max( maxx, x );
			miny = Math.min( miny, y );
			maxy = Math.max( maxy, y );

		}
		const inside = ( x, y ) => pointInPolys( x, y, b.polys );
		const ok = ( x, y ) => inside( x, y - PANEL_D / 2 - INSET ) && inside( x, y + PANEL_D / 2 + INSET ) &&
			inside( x - INSET, y ) && inside( x + INSET, y );
		const rows = [];
		for ( let y = miny + INSET + PANEL_D / 2; y < maxy - INSET - PANEL_D / 2; y += ROW_PITCH ) {

			const runs = [];
			let start = null;
			for ( let x = minx; x <= maxx + STEP; x += STEP ) {

				const good = x <= maxx && ok( x, y );
				if ( good && start === null ) start = x;
				if ( ! good && start !== null ) {

					if ( x - STEP - start >= 3 ) runs.push( [ start, x - STEP ] );
					start = null;

				}

			}
			if ( runs.length ) rows.push( { y, runs } );

		}
		rows.forEach( ( r, ri ) => r.runs.forEach( ( [ x0, x1 ] ) => strips.push( {
			x0, len: x1 - x0, y: b.top + 0.9, z: - r.y, bi, order: rows.length > 1 ? ri / ( rows.length - 1 ) : 0,
		} ) ) );

	} );

	const geom = new THREE.PlaneGeometry( 1, PANEL_D );
	geom.translate( 0.5, 0, 0 ); // 以西端为原点，便于沿东西向"生长"
	geom.rotateX( - Math.PI / 2 );
	const mat = new THREE.ShaderMaterial( {
		transparent: true, depthWrite: false, depthTest: false,
		uniforms: { uTime: { value: 0 }, uOpacity: { value: 1 } },
		vertexShader: /* glsl */`
			varying vec2 vUv; varying vec3 vW;
			void main(){
				vUv = uv;
				vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
				vW = wp.xyz;
				gl_Position = projectionMatrix * viewMatrix * wp;
			}`,
		fragmentShader: /* glsl */`
			varying vec2 vUv; varying vec3 vW; uniform float uTime; uniform float uOpacity;
			void main(){
				// 组件分隔线按世界坐标（1.05 m 一块），距离远时自动淡出，避免闪烁成"噪点"
				float m = vW.x / 1.05;
				float w = fwidth(m);
				float d = 0.5 - abs(fract(m) - 0.5);
				float line = (1.0 - smoothstep(0.02, 0.02 + w * 1.5, d)) * clamp(1.0 - w * 4.0, 0.0, 1.0);
				float frame = 1.0 - smoothstep(0.0, 0.08, min(vUv.y, 1.0 - vUv.y));
				vec3 c = mix(vec3(0.05, 0.12, 0.27), vec3(0.14, 0.30, 0.55), vUv.y);
				float sheen = pow(0.5 + 0.5 * sin(vW.x * 0.04 - vW.z * 0.02 - uTime * 0.9), 10.0);
				c += vec3(0.45, 0.7, 1.0) * sheen * 0.35;
				c = mix(c, vec3(0.62, 0.74, 0.86), max(line * 0.35, frame * 0.6));
				gl_FragColor = vec4(c, 0.96 * uOpacity);
			}`,
	} );
	mat.extensions = { derivatives: true };
	const mesh = new THREE.InstancedMesh( geom, mat, Math.max( 1, strips.length ) );
	mesh.renderOrder = 13;
	mesh.frustumCulled = false;
	mesh.userData.strips = strips;
	return mesh;

}

const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _p = new THREE.Vector3();
// progressFor(bi) → 0..1，该楼铺设进度：逐排（南→北）出现，每排自西向东延展
export function updatePanels( mesh, progressFor ) {

	const { strips } = mesh.userData;
	for ( let i = 0; i < strips.length; i ++ ) {

		const st = strips[ i ];
		const k = THREE.MathUtils.clamp( ( progressFor( st.bi ) * 1.2 - st.order ) / 0.2, 0, 1 );
		const e = 1 - Math.pow( 1 - k, 3 );
		_p.set( st.x0, st.y, st.z );
		_s.set( Math.max( 1e-4, st.len * e ), 1, e > 0 ? 1 : 1e-4 );
		_m.compose( _p, _q, _s );
		mesh.setMatrixAt( i, _m );

	}
	mesh.instanceMatrix.needsUpdate = true;

}
