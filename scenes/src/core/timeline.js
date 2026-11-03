// 时间线工具。每个主题提供自己的幕表 acts；所有画面参数都是循环时间 t 的纯函数，可任意跳转/定格。

// 实验室闭环的五个步骤（与网站 data/loop.yaml 一致），所有主题共用，HUD 圆环按它画节点。
export const LOOP_STEPS = [
	{ key: 'perceive' },
	{ key: 'model' },
	{ key: 'decide' },
	{ key: 'act' },
	{ key: 'feedback' },
];

// acts: [{ key, dur, step, title: { en, zh } }]，step 为 LOOP_STEPS 中的 key 或 null（能源系统本身）
export function makeTimeline( acts ) {

	const total = acts.reduce( ( s, a ) => s + a.dur, 0 );
	const starts = acts.reduce( ( arr, a, i ) => ( arr.push( i ? arr[ i - 1 ] + acts[ i - 1 ].dur : 0 ), arr ), [] );

	function locate( t ) {

		t = ( ( t % total ) + total ) % total;
		let i = acts.length - 1;
		while ( starts[ i ] > t ) i --;
		return { i, p: ( t - starts[ i ] ) / acts[ i ].dur, t, act: acts[ i ] };

	}

	return { acts, total, starts, locate };

}

export const clamp01 = x => Math.min( 1, Math.max( 0, x ) );
export const smooth = x => {

	x = clamp01( x );
	return x * x * ( 3 - 2 * x );

};
// 在 [a, b] 区间内从 0 平滑到 1
export const ramp = ( p, a, b ) => smooth( ( p - a ) / ( b - a ) );
export const lerp = ( a, b, k ) => a + ( b - a ) * k;

// 按幕取值：vals[i] 为第 i 幕的稳态值，进入新幕时在 [0, blend] 内从上一幕过渡
export function byAct( loc, vals, blend = 0.3 ) {

	const prev = vals[ ( loc.i + vals.length - 1 ) % vals.length ];
	return lerp( prev, vals[ loc.i ], ramp( loc.p, 0, blend ) );

}
