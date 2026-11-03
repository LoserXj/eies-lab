// Hero over a live 3D scene (layouts/_partials/hbx/blocks/hero-scene). Loads the scene iframe after the page
// is idle, fades it in when the scene posts { type: 'lab-scene', event: 'ready' }, pauses it off-screen.
// Small screens, reduced motion and data-saver keep the poster only.
( () => {

	const root = document.querySelector( '[data-hero-scene]' );
	if ( ! root ) return;
	const frame = root.querySelector( '.hs-frame' );
	const save = navigator.connection && navigator.connection.saveData;
	const live = window.matchMedia( '(min-width: 768px) and (prefers-reduced-motion: no-preference)' ).matches && ! save;
	if ( ! live || ! frame ) return;

	const post = msg => frame.contentWindow && frame.contentWindow.postMessage( { type: 'lab-scene', ...msg }, '*' );

	window.addEventListener( 'message', ( e ) => {

		if ( e.source !== frame.contentWindow || ! e.data || e.data.type !== 'lab-scene' ) return;
		if ( e.data.event === 'ready' ) root.classList.add( 'is-live' );
		if ( e.data.event === 'error' ) frame.remove();

	} );

	// Pause rendering while the hero is off-screen
	new IntersectionObserver( ( [ entry ] ) => post( { paused: ! entry.isIntersecting } ), { threshold: 0.05 } ).observe( root );

	const start = () => { frame.src = frame.dataset.src; };
	if ( 'requestIdleCallback' in window ) window.requestIdleCallback( start, { timeout: 2000 } );
	else window.setTimeout( start, 800 );

} )();
