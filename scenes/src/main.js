import { readParams } from './core/params.js';
import { createStage, run } from './core/stage.js';
import { makeTimeline } from './core/timeline.js';
import { PLACES, DEFAULT_PLACE } from './places/index.js';
import { THEMES, DEFAULT_THEME } from './themes/index.js';

// 入口：按 URL 参数选场地与主题 → 搭舞台 → 主题 setup → 主循环。
// 嵌在 iframe 里时，加载完成 / 失败会通知宿主页面：{ type: 'lab-scene', event: 'ready' | 'error' }。
const params = readParams();
document.documentElement.style.setProperty( '--dim', String( params.dim ) );
document.body.classList.add( 'hud-' + params.hud );

const notify = msg => window.parent !== window && window.parent.postMessage( { type: 'lab-scene', ...msg }, '*' );

try {

	const place = PLACES[ params.place ] || PLACES[ DEFAULT_PLACE ];
	const themeKey = THEMES[ params.theme ] ? params.theme : DEFAULT_THEME;
	const dataBase = ( params.data || `/scene-data/${place.key}/` ).replace( /\/?$/, '/' );

	const [ { default: theme }, stage ] = await Promise.all( [
		THEMES[ themeKey ](),
		createStage( { place, dataBase, hudMode: params.hud, lang: params.lang, shift: params.shift } ),
	] );
	const instance = await theme.setup( stage );
	const timeline = makeTimeline( theme.acts );
	const control = run( stage, timeline, instance, { act: params.act, speed: params.speed } );

	document.body.classList.add( 'ready' );
	notify( { event: 'ready', theme: theme.key, place: place.key } );
	// 开发辅助：在控制台运行 __scene.capture( 4, 0.87 ) 定格到第 4 幕 87% 处，等瓦片加载后下载一张 JPG，
	// 用作网站首页海报（assets/media/scenes/<theme>-<place>.jpg）。
	async function capture( act, p = 0.5, frames = 60 ) {

		control.setPaused( true );
		const loc = timeline.locate( timeline.starts[ act ] + p * theme.acts[ act ].dur );
		const draw = k => {

			instance.update( loc, 20 + k * 0.016 );
			stage.camera.updateMatrixWorld();
			stage.tiles.update();
			stage.renderer.render( stage.scene, stage.camera );

		};
		for ( let k = 0; k < frames; k ++ ) {

			draw( k );
			await new Promise( r => setTimeout( r, 120 ) );

		}
		draw( frames );
		const blob = await new Promise( r => stage.renderer.domElement.toBlob( r, 'image/jpeg', 0.86 ) );
		const a = Object.assign( document.createElement( 'a' ), { href: URL.createObjectURL( blob ), download: `${theme.key}-${place.key}.jpg` } );
		a.click();
		control.setPaused( false );
		return blob;

	}
	window.__scene = { ...stage, theme, instance, control, capture };

} catch ( err ) {

	console.error( '[scenes]', err );
	notify( { event: 'error', message: String( err && err.message || err ) } );

}
