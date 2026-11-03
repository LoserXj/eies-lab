// Hero over the 3D scene (layouts/_partials/hbx/blocks/hero-scene). Two sources:
// - a recorded video of the scene loop (.hs-video): starts after the page is idle, fades in once playing; the act
//   buttons show which act is on screen and jump to an act when clicked;
// - the live scene in an iframe (.hs-frame): fades in when the scene posts { type: 'lab-scene', event: 'ready' }.
// Both pause while the hero is off-screen. Small screens, reduced motion and data-saver keep the poster only.
( () => {

	const root = document.querySelector( '[data-hero-scene]' );
	if ( ! root ) return;
	const video = root.querySelector( '.hs-video' );
	const frame = root.querySelector( '.hs-frame' );
	const save = navigator.connection && navigator.connection.saveData;
	const live = window.matchMedia( '(min-width: 768px) and (prefers-reduced-motion: no-preference)' ).matches && ! save;
	if ( ! live || ! ( video || frame ) ) return;
	const idle = fn => ( 'requestIdleCallback' in window ? window.requestIdleCallback( fn, { timeout: 2000 } ) : window.setTimeout( fn, 800 ) );

	if ( video ) {

		const acts = [ ...root.querySelectorAll( '.hs-act' ) ].map( b => ( { b, start: Number( b.dataset.start ), dur: Number( b.dataset.dur ) } ) );
		let raf = 0, onScreen = true, started = false;

		const tick = () => {

			const t = video.currentTime;
			for ( const a of acts ) {

				const on = t >= a.start && t < a.start + a.dur;
				a.b.classList.toggle( 'is-on', on );
				if ( on ) a.b.setAttribute( 'aria-current', 'step' );
				else a.b.removeAttribute( 'aria-current' );
				a.b.style.setProperty( '--p', on ? ( ( t - a.start ) / a.dur ).toFixed( 4 ) : '0' );

			}
			raf = video.paused ? 0 : requestAnimationFrame( tick );

		};
		const play = () => video.play().catch( () => {} );

		video.addEventListener( 'playing', () => {

			root.classList.add( 'is-live' );
			if ( ! raf ) raf = requestAnimationFrame( tick );

		} );
		// Keep the poster if no source can play (an error on a source the browser skipped is not a failure)
		video.querySelector( 'source:last-of-type' ).addEventListener( 'error', () => {

			if ( video.readyState === 0 ) video.remove();

		} );
		for ( const a of acts ) a.b.addEventListener( 'click', () => {

			video.currentTime = a.start;
			tick();
			if ( onScreen ) play();

		} );
		new IntersectionObserver( ( [ entry ] ) => {

			onScreen = entry.isIntersecting;
			if ( ! started ) return;
			if ( onScreen ) play();
			else video.pause();

		}, { threshold: 0.05 } ).observe( root );

		idle( () => {

			// The browser picks the first <source> it can play (AV1, else H.264) and downloads only that one.
			for ( const s of video.querySelectorAll( 'source' ) ) s.src = s.dataset.src;
			video.load();
			started = true;
			if ( onScreen ) play();

		} );
		return;

	}

	const post = msg => frame.contentWindow && frame.contentWindow.postMessage( { type: 'lab-scene', ...msg }, '*' );

	window.addEventListener( 'message', ( e ) => {

		if ( e.source !== frame.contentWindow || ! e.data || e.data.type !== 'lab-scene' ) return;
		if ( e.data.event === 'ready' ) root.classList.add( 'is-live' );
		if ( e.data.event === 'error' ) frame.remove();

	} );

	// Pause rendering while the hero is off-screen
	new IntersectionObserver( ( [ entry ] ) => post( { paused: ! entry.isIntersecting } ), { threshold: 0.05 } ).observe( root );

	idle( () => { frame.src = frame.dataset.src; } );

} )();
