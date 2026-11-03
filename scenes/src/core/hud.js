import { LOOP_STEPS } from './timeline.js';

const R = 40, CIRC = 2 * Math.PI * R;
const nodeXY = k => {

	const a = - Math.PI / 2 + k * 2 * Math.PI / LOOP_STEPS.length;
	return [ 52 + R * Math.cos( a ), 52 + R * Math.sin( a ) ];

};

// 背景上的极简标注层：闭环进度、锚定标签、数据署名；主题可用 addCard 加自己的卡片。
// lang: 'en' | 'zh'，幕标题按语言取；credit: 数据署名（场地配置提供，必须显示）。
export function makeHud( root, { lang = 'en', credit = '' } = {} ) {

	root.innerHTML = `
		<div class="hud-loop">
			<svg class="hud-ring" viewBox="0 0 104 104" aria-hidden="true">
				<circle class="track" cx="52" cy="52" r="${R}"/>
				<circle class="arc" cx="52" cy="52" r="${R}" stroke-dasharray="${CIRC}" stroke-dashoffset="${CIRC}" transform="rotate(-90 52 52)"/>
				${LOOP_STEPS.map( ( s, k ) => {

		const [ x, y ] = nodeXY( k );
		return `<circle class="node" data-k="${s.key}" cx="${x.toFixed( 2 )}" cy="${y.toFixed( 2 )}" r="3.2"/>`;

	} ).join( '' )}
				<text class="idx" x="52" y="57" text-anchor="middle"></text>
			</svg>
			<div class="hud-title"></div>
		</div>
		<div class="hud-labels"></div>
		<div class="hud-credit">${credit}</div>
	`;
	const $ = s => root.querySelector( s );
	const loop = $( '.hud-loop' );
	const arc = $( '.hud-ring .arc' );
	const nodes = [ ...root.querySelectorAll( '.hud-ring .node' ) ];
	const labelsEl = $( '.hud-labels' );
	const labels = new Map();

	let lastAct = - 1;
	function setAct( i, act ) {

		if ( i === lastAct ) return;
		lastAct = i;
		loop.classList.remove( 'in' );
		void loop.offsetWidth;
		loop.classList.add( 'in' );
		$( '.hud-ring .idx' ).textContent = String( i ).padStart( 2, '0' );
		$( '.hud-title' ).textContent = act.title[ lang ] || act.title.en;
		nodes.forEach( n => n.classList.toggle( 'on', n.dataset.k === act.step ) );
		root.classList.toggle( 'system', act.step === null );

	}

	// 圆环进度：走到第 stepIdx 个节点，再沿下一段推进 p
	function setProgress( stepIdx, p ) {

		const frac = stepIdx < 0 ? 0 : ( stepIdx + p ) / LOOP_STEPS.length;
		arc.setAttribute( 'stroke-dashoffset', ( CIRC * ( 1 - frac ) ).toFixed( 2 ) );
		nodes.forEach( ( n, k ) => n.classList.toggle( 'done', stepIdx >= 0 && k < stepIdx ) );

	}

	// items: [{ id, x, y, html, opacity }]
	function setLabels( items ) {

		const seen = new Set();
		for ( const it of items ) {

			seen.add( it.id );
			let el = labels.get( it.id );
			if ( ! el ) {

				el = document.createElement( 'div' );
				el.className = 'hud-label ' + ( it.cls || '' );
				labelsEl.appendChild( el );
				labels.set( it.id, el );

			}
			if ( el._html !== it.html ) {

				el.innerHTML = it.html;
				el._html = it.html;

			}
			el.style.transform = `translate(${it.x.toFixed( 1 )}px, ${it.y.toFixed( 1 )}px)`;
			el.style.opacity = it.opacity.toFixed( 3 );

		}
		for ( const [ id, el ] of labels ) if ( ! seen.has( id ) ) el.style.opacity = 0;

	}

	function addCard( cls, html ) {

		const el = document.createElement( 'div' );
		el.className = 'hud-card ' + cls;
		el.innerHTML = html;
		root.insertBefore( el, $( '.hud-credit' ) );
		return el;

	}

	return { setAct, setProgress, setLabels, addCard };

}
