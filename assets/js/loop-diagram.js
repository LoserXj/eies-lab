// Animated loop diagram (layouts/_partials/hbx/blocks/loop-diagram): lights the five steps in turn while the
// diagram is on screen. Clicking a step holds it for a while. Reduced motion: no auto-advance and no live scene.
// The live 3D scene (assets/js/loop-scene.js, URL in data-scene) is fetched only when the diagram nears the screen;
// steps stay long enough for its actions to play out.
( () => {

	const root = document.querySelector( '[data-loop-diagram]' );
	if ( ! root ) return;
	const keys = [ ...root.querySelectorAll( '.ld-steps button' ) ].map( b => b.dataset.k );
	const STEP_MS = { perceive: 4600, model: 4000, decide: 4000, act: 6200, feedback: 4400 }, HOLD_MS = 9000;
	const still = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;
	let i = 0, visible = false, holdUntil = 0;

	const show = k => {

		root.dataset.step = k;
		root.querySelectorAll( '.ld-steps button' ).forEach( b => b.setAttribute( 'aria-pressed', String( b.dataset.k === k ) ) );

	};
	const tick = () => {

		if ( visible && ! still && Date.now() >= holdUntil ) {

			i = ( i + 1 ) % keys.length;
			show( keys[ i ] );

		}
		window.setTimeout( tick, STEP_MS[ keys[ i ] ] || 4000 );

	};

	root.querySelectorAll( '.ld-steps button' ).forEach( b => b.addEventListener( 'click', () => {

		i = keys.indexOf( b.dataset.k );
		show( b.dataset.k );
		holdUntil = Date.now() + HOLD_MS;

	} ) );

	new IntersectionObserver( ( [ e ] ) => { visible = e.isIntersecting; }, { threshold: 0.3 } ).observe( root );
	show( keys[ 0 ] );
	window.setTimeout( tick, STEP_MS[ keys[ 0 ] ] || 4000 );

	if ( ! still && root.dataset.scene ) {

		const io = new IntersectionObserver( ( [ e ] ) => {

			if ( ! e.isIntersecting ) return;
			io.disconnect();
			const s = document.createElement( 'script' );
			s.type = 'module'; s.src = root.dataset.scene;
			document.head.append( s );

		}, { rootMargin: '400px 0px' } );
		io.observe( root );

	}

} )();
