import { clamp01 } from './timeline.js';

// URL 参数（宿主页面通过 iframe src 传入）：
// ?theme=pv       研究主题（themes/index.js）
// ?place=polyu    场地（places/index.js）
// ?data=URL       数据目录，默认 /scene-data/<place>/（与场景代码同源部署）
// ?act=N          定格在第 N 幕循环播放（旧名 ?scene=N 仍可用）
// ?hud=full|lite|0  标注：全部 / 只留闭环进度与署名 / 只留署名
// ?lang=en|zh     幕标题语言
// ?dim=0..1       整体压暗，方便上层文字
// ?speed=1        播放速度
// ?shift=0..0.5   画面主体向右平移的比例（宿主页面左侧有文字时用），只移取景、不动相机
export function readParams( search = location.search ) {

	const q = new URLSearchParams( search );
	const actRaw = q.get( 'act' ) ?? q.get( 'scene' );
	const hud = q.get( 'hud' );
	return {
		theme: q.get( 'theme' ),
		place: q.get( 'place' ),
		data: q.get( 'data' ),
		act: actRaw === null || actRaw === '' ? null : Number( actRaw ),
		hud: hud === '0' ? 'off' : hud === 'lite' ? 'lite' : 'full',
		lang: q.get( 'lang' ) === 'zh' ? 'zh' : 'en',
		dim: clamp01( Number( q.get( 'dim' ) || 0 ) ),
		speed: Number( q.get( 'speed' ) || 1 ),
		shift: Math.min( 0.5, Math.max( 0, Number( q.get( 'shift' ) || 0 ) ) ),
	};

}
