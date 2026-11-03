import { Color, Vector2 } from 'three';

// 所有材质共享的"扫描揭幕"参数。扫描线 = 世界 xz 平面上沿 uDir 的一条直线，位置 uScan。
export const reveal = {
	uScan: { value: - 1e5 },
	uDir: { value: new Vector2( 1, 0 ) },
	uDim: { value: 0 },
	uDesat: { value: 0 },
	uTint: { value: new Color( 0x5d7fa8 ) },
	uGlow: { value: new Color( 0x7fe9ff ) },
	uBand: { value: 0 },
};

const HEAD = /* glsl */`
uniform float uScan; uniform vec2 uDir; uniform float uDim; uniform float uDesat;
uniform vec3 uTint; uniform vec3 uGlow; uniform float uBand;
varying vec3 vRevealPos;
`;

// mode: 'real'  → 已扫描区域可见（实景）
//       'white' → 未扫描区域可见（白模、地面）
export function patchReveal( material, mode ) {

	if ( material.userData.revealPatched ) return material;
	material.userData.revealPatched = true;
	const keep = mode === 'real' ? 'al > uScan' : 'al < uScan';

	material.onBeforeCompile = ( shader ) => {

		Object.assign( shader.uniforms, reveal );
		shader.vertexShader = 'varying vec3 vRevealPos;\n' + shader.vertexShader.replace(
			'#include <project_vertex>',
			'#include <project_vertex>\n vRevealPos = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz;',
		);

		let body = `
		float al = dot( vRevealPos.xz, uDir );
		if ( ${keep} ) discard;
		float band = 1.0 - smoothstep( 0.0, 22.0, abs( uScan - al ) );
		`;
		if ( mode === 'real' ) {

			body += `
			vec3 c = gl_FragColor.rgb;
			float l = dot( c, vec3( 0.299, 0.587, 0.114 ) );
			c = mix( c, l * uTint * 1.6, uDesat ) * ( 1.0 - uDim );
			gl_FragColor.rgb = c + uGlow * band * band * uBand * 0.9;
			`;

		} else {

			body += 'gl_FragColor.rgb += uGlow * band * band * uBand * 0.6;';

		}

		shader.fragmentShader = HEAD + shader.fragmentShader.replace(
			'#include <fog_fragment>',
			body + '\n#include <fog_fragment>',
		);

	};
	material.customProgramCacheKey = () => 'reveal-' + mode;
	material.needsUpdate = true;
	return material;

}
