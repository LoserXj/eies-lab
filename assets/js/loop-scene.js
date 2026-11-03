// Live white-model scene for the loop diagram (layouts/_partials/hbx/blocks/loop-diagram). Same camera and models
// as the poster assets/media/home/loop-scene.webp, so the SVG overlay from data/loop_scene.json still lines up.
// Each step plays its action in the scene:
//   perceive  the roof sensor, solar array and battery send out pings; an EV that charged last round drives off
//   model     a cloud drifts in and its shadow slides over the solar roof
//   decide    power from the roof flows into the battery, the grid line goes quiet, the battery level rises
//   act       an EV drives into the charging bay and plugs in, the drone flies out and scans the panels,
//             the roof AC pre-cools
//   feedback  the result runs back round the loop to step 1; the drone lands
// Loaded by assets/js/loop-diagram.js when the diagram nears the screen; with reduced motion or no WebGL the poster
// stays. createLoopScene() is exported for re-rendering the poster.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const V = ( x, y, z ) => new THREE.Vector3( x, y, z );
const clamp01 = x => Math.min( 1, Math.max( 0, x ) );
const smooth = x => { x = clamp01( x ); return x * x * ( 3 - 2 * x ); };
const easeOut = x => 1 - Math.pow( 1 - clamp01( x ), 3 );
const easeIn = x => Math.pow( clamp01( x ), 2 );
const span = ( t, a, b ) => clamp01( ( t - a ) / ( b - a ) );

export function createLoopScene( { shadowSize = 2048 } = {} ) {

	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera( 27, 16 / 9, 1, 1000 );
	camera.position.set( 100, 78, 128 ); camera.lookAt( - 1, 4, 2 );

	scene.add( new THREE.HemisphereLight( 0xffffff, 0xd8d8d8, 1.9 ) );
	const sun = new THREE.DirectionalLight( 0xffffff, 2.1 );
	sun.position.set( - 40, 90, 55 ); sun.castShadow = true;
	sun.shadow.mapSize.set( shadowSize, shadowSize ); sun.shadow.radius = 6; sun.shadow.bias = - 0.0004;
	Object.assign( sun.shadow.camera, { left: - 95, right: 95, top: 95, bottom: - 95, near: 1, far: 320 } ); sun.shadow.camera.updateProjectionMatrix();
	scene.add( sun );

	const white = new THREE.MeshStandardMaterial( { color: 0xffffff, roughness: .92 } );
	const pale = new THREE.MeshStandardMaterial( { color: 0xe4e4e4, roughness: .95 } );
	const mid = new THREE.MeshStandardMaterial( { color: 0xcfcfcf, roughness: .95 } );
	const dark = new THREE.MeshStandardMaterial( { color: 0x1c1c1c, roughness: .5, metalness: .2 } );
	const glass = new THREE.MeshStandardMaterial( { color: 0x2e2e2e, roughness: .25, metalness: .3 } );
	const black = new THREE.MeshStandardMaterial( { color: 0x000000, roughness: .6 } );
	const fxMat = ( color = 0x000000 ) => new THREE.MeshBasicMaterial( { color, transparent: true, opacity: 0, depthWrite: false } );

	const mesh = ( geo, mat, x = 0, y = 0, z = 0, o = {} ) => {

		const m = new THREE.Mesh( geo, mat ); m.position.set( x, y, z );
		m.castShadow = o.cast !== false; m.receiveShadow = true;
		if ( o.ry ) m.rotation.y = o.ry; if ( o.rx ) m.rotation.x = o.rx; if ( o.rz ) m.rotation.z = o.rz;
		return m;

	};
	const add = ( geo, mat, x, y, z, o = {} ) => { const m = mesh( geo, mat, x, y, z, o ); ( o.to || scene ).add( m ); return m; };
	const box = ( w, h, d, r = 0 ) => r ? new RoundedBoxGeometry( w, h, d, 3, r ) : new THREE.BoxGeometry( w, h, d );
	const rod = ( a, b, r = .18, mat = dark ) => {

		const v = new THREE.Vector3().subVectors( b, a ); const m = new THREE.Mesh( new THREE.CylinderGeometry( r, r, 1, 6 ), mat );
		m.scale.y = v.length(); m.position.copy( a ).addScaledVector( v, .5 );
		m.quaternion.setFromUnitVectors( V( 0, 1, 0 ), v.clone().normalize() ); m.castShadow = true; scene.add( m ); return m;

	};

	add( new THREE.PlaneGeometry( 900, 900 ), new THREE.ShadowMaterial( { opacity: .13 } ), 0, 0, 0, { cast: false, rx: - Math.PI / 2 } );

	// road along the front + sidewalk + lamps, path on site
	add( box( 260, .12, 12 ), mid, 0, .06, 40, { cast: false } );
	for ( let x = - 120; x < 120; x += 9 ) add( box( 4, .14, .4 ), white, x, .1, 40, { cast: false } );
	add( box( 260, .3, 3 ), white, 0, .15, 32.5, { cast: false } );
	for ( let x = - 60; x <= 60; x += 24 ) { rod( V( x, 0, 32.5 ), V( x, 7, 32.5 ), .12, pale ); add( box( 1.8, .2, .5 ), pale, x + .7, 7, 32.5 ); }
	add( box( 4, .08, 24 ), white, 0, .04, 20, { cast: false } );

	// main building with the solar roof
	const BW = 26, BH = 15, BD = 16;
	add( box( BW, BH, BD, .3 ), white, 0, BH / 2 + .4, 0 );
	for ( const y of [ 4.4, 8.4, 12.4 ] ) {

		add( box( BW + .05, 2.4, BD - 2 ), glass, 0, y, 0, { cast: false } );
		add( box( BW - 2, 2.4, BD + .05 ), glass, 0, y, 0, { cast: false } );
		for ( let i = - 3; i <= 3; i ++ ) add( box( .1, 2.45, BD + .1 ), white, i * 3.6, y, 0, { cast: false } );
		for ( let i = - 2; i <= 2; i ++ ) add( box( BW + .1, 2.45, .1 ), white, 0, y, i * 3.4, { cast: false } );

	}
	add( box( BW + .6, .9, BD + .6, .2 ), white, 0, BH + .8, 0 );
	add( box( BW - 1.2, .2, BD - 1.2 ), pale, 0, BH + 1.1, 0, { cast: false } );
	add( box( 6, 3.2, .4 ), glass, 0, 2, BD / 2 + .05, { cast: false } );
	add( box( 8, .3, 3, .1 ), white, 0, 3.8, BD / 2 + 1.5 );
	const panelGeo = box( 4, .15, 2.2 ), panels = [];
	for ( let r = 0; r < 4; r ++ ) for ( let c = 0; c < 5; c ++ ) {

		const p = add( panelGeo, dark.clone(), - 9.6 + c * 4.8, BH + 2, - 5.4 + r * 3.6, { rx: - .28 } );
		p.userData.lit = 0; panels.push( p );

	}
	// roof AC units with fans
	const fans = [];
	for ( const x of [ 8.4, 11 ] ) {

		add( box( 2, 1.3, 1.7, .15 ), pale, x, BH + 1.9, 6.1 );
		add( new THREE.CylinderGeometry( .62, .62, .06, 24 ), dark, x, BH + 2.58, 6.1, { cast: false } );
		const fan = new THREE.Group(); fan.position.set( x, BH + 2.64, 6.1 );
		for ( const a of [ 0, Math.PI / 2 ] ) add( box( 1.1, .04, .22 ), white, 0, 0, 0, { to: fan, ry: a, cast: false } );
		scene.add( fan ); fans.push( fan );

	}
	const sensor = V( - 11.5, BH + 5.4, 6.2 );
	rod( V( - 11.5, BH + 1.2, 6.2 ), sensor, .1 ); add( new THREE.SphereGeometry( .45, 16, 12 ), black, sensor.x, sensor.y, sensor.z );

	// annex with skylights, skybridge, drone pad on its roof
	add( box( 18, 7, 12, .25 ), white, - 31, 3.9, - 12 );
	add( box( 18.05, 1.8, 10 ), glass, - 31, 4, - 12, { cast: false } ); add( box( 16, 1.8, 12.05 ), glass, - 31, 4, - 12, { cast: false } );
	add( box( 17, .3, 11 ), pale, - 31, 7.55, - 12, { cast: false } );
	for ( const x of [ - 36, - 31, - 26 ] ) add( box( 2.4, .9, 2.4, .1 ), glass, x, 8, - 14 );
	rod( V( - 22, 4.5, - 8 ), V( - 13, 4.5, - 4 ), .5, white );
	const PAD = V( - 28, 7.7, - 9.2 );
	add( new THREE.CylinderGeometry( 2, 2, .06, 40 ), black, PAD.x, PAD.y + .03, PAD.z, { cast: false } );
	add( new THREE.CylinderGeometry( 1.6, 1.6, .08, 40 ), white, PAD.x, PAD.y + .05, PAD.z, { cast: false } );

	// battery containers (front one shows its charge level) + transformer
	for ( const z of [ 12, 16.4 ] ) {

		add( box( 11, 3.4, 3.6, .15 ), white, - 26, 2.1, z );
		for ( let i = - 4; i <= 4; i ++ ) add( box( .18, 3, .1 ), pale, - 26 + i * 1.1, 2.1, z + 1.85, { cast: false } );

	}
	add( box( 9, .55, .08 ), mid, - 26, 3.05, 18.32, { cast: false } );
	const level = add( box( 1, .55, .1 ).translate( .5, 0, 0 ), black, - 30.5, 3.05, 18.34, { cast: false } );
	const battery = V( - 26, 4.2, 14.2 );
	add( box( 4, 3, 4, .1 ), pale, - 37, 1.9, 14 ); for ( let i = 0; i < 4; i ++ ) add( box( .15, 2.2, 4.2 ), white, - 38.4 + i * .9, 3.5, 14 );
	for ( const [ a, b ] of [ [ V( - 40, 0, 11 ), V( - 40, 0, 17 ) ], [ V( - 40, 0, 17 ), V( - 34, 0, 17 ) ], [ V( - 34, 0, 11 ), V( - 40, 0, 11 ) ] ] ) {

		for ( let t = 0; t <= 6; t += 1.5 ) { const p = a.clone().lerp( b, t / 6 ); rod( p, p.clone().setY( 2 ), .06, mid ); }
		rod( a.clone().setY( 1.9 ), b.clone().setY( 1.9 ), .05, mid );

	}

	// EV parking: bays, chargers, two parked cars; the EV bay is the middle charger
	const car = ( body, cab ) => {

		const g = new THREE.Group();
		add( box( 2.2, 1.1, 4.6, .45 ), body, 0, .95, 0, { to: g } );
		add( box( 1.9, .9, 2.4, .4 ), cab, 0, 1.8, - .2, { to: g } );
		return g;

	};
	for ( let i = 0; i < 5; i ++ ) add( box( .3, .1, 6 ), white, 15 + i * 3.6, .1, 17, { cast: false } );
	const screens = [];
	for ( const x of [ 16.8, 20.4, 24 ] ) {

		add( box( .8, 2.2, .6, .12 ), white, x, 1.5, 13.6 );
		screens.push( add( box( .55, .45, .1 ), new THREE.MeshBasicMaterial( { color: 0x000000 } ), x, 2, 13.92, { cast: false } ) );

	}
	const ev = V( 20.4, 3, 13.6 ), BAY = V( 20.4, 0, 17.6 );
	for ( const x of [ 16.8, 27.6 ] ) { const c = car( pale, mid ); c.position.set( x, 0, 17.6 ); c.rotation.y = Math.PI; scene.add( c ); }
	const evCar = car( white, black ); scene.add( evCar );
	const plug = add( new THREE.TubeGeometry( new THREE.QuadraticBezierCurve3( V( 20.4, 1.9, 13.95 ), V( 20.7, .5, 14.6 ), V( 20.4, 1.1, 15.25 ) ), 16, .07, 5 ), black, 0, 0, 0, { cast: false } );

	// EV routes: in from the left along the road into the bay; out by reversing onto the road and driving off left
	const route = ( ...segs ) => { const p = new THREE.CurvePath(); segs.forEach( s => p.add( s ) ); return p; };
	const IN = route(
		new THREE.LineCurve3( V( - 92, 0, 42.5 ), V( 6, 0, 42.5 ) ),
		new THREE.QuadraticBezierCurve3( V( 6, 0, 42.5 ), V( 20.4, 0, 42.5 ), V( 20.4, 0, 30 ) ),
		new THREE.LineCurve3( V( 20.4, 0, 30 ), BAY ) );
	const BACK = route(
		new THREE.LineCurve3( BAY, V( 20.4, 0, 29 ) ),
		new THREE.QuadraticBezierCurve3( V( 20.4, 0, 29 ), V( 20.4, 0, 38 ), V( 29, 0, 38 ) ) );
	const OUT = route( new THREE.LineCurve3( V( 29, 0, 38 ), V( - 92, 0, 38 ) ) );
	const onRoute = ( path, u, reverse ) => {

		const p = path.getPointAt( clamp01( u ) ), d = path.getTangentAt( clamp01( u ) );
		if ( reverse ) d.negate();
		evCar.position.copy( p ); evCar.rotation.y = Math.atan2( d.x, d.z );

	};

	// wind turbine, pylon with its line to the transformer
	const rotor = new THREE.Group();
	{

		const p = V( 64, 0, - 8 ), h = 21; add( new THREE.CylinderGeometry( .35, .7, h, 16 ), white, p.x, h / 2, p.z ); add( box( 1.2, 1.2, 2.8, .4 ), white, p.x, h, p.z + .6 );
		rotor.position.set( p.x, h, p.z + 2.1 ); scene.add( rotor );
		for ( let k = 0; k < 3; k ++ ) { const bl = add( box( .55, 9, .15, .1 ).translate( 0, 4.5, 0 ), white, 0, 0, 0, { to: rotor } ); bl.rotation.z = k * Math.PI * 2 / 3 + .4; }

	}
	let gridLine;
	{

		const tx = - 76, tz = 2, h = 20;
		const base = [ [ - 3, - 3 ], [ 3, - 3 ], [ 3, 3 ], [ - 3, 3 ] ].map( ( [ x, z ] ) => V( tx + x, 0, tz + z ) ), top = [ [ - .8, - .8 ], [ .8, - .8 ], [ .8, .8 ], [ - .8, .8 ] ].map( ( [ x, z ] ) => V( tx + x, h, tz + z ) );
		for ( let i = 0; i < 4; i ++ ) { rod( base[ i ], top[ i ] ); const j = ( i + 1 ) % 4; for ( const t of [ .25, .5, .75 ] ) rod( base[ i ].clone().lerp( top[ i ], t ), base[ j ].clone().lerp( top[ j ], t ) ); rod( base[ i ], base[ j ].clone().lerp( top[ j ], .25 ) ); }
		for ( const y of [ h - 4, h - 8 ] ) rod( V( tx - 7, y, tz ), V( tx + 7, y, tz ) );
		gridLine = new THREE.QuadraticBezierCurve3( V( tx + 7, h - 4, tz ), V( tx + 20, h - 10, tz + 10 ), V( - 37, 2, 14 ) );
		scene.add( new THREE.Mesh( new THREE.TubeGeometry( gridLine, 40, .08, 5 ), dark ) );

	}

	// trees, people, benches
	for ( const [ x, z, s ] of [ [ - 14, 20, 1.1 ], [ - 8, 23, .9 ], [ 10, 24, 1 ], [ 14, - 18, 1.2 ], [ - 18, - 26, 1 ], [ 34, - 6, 1.1 ], [ - 44, 2, .9 ], [ - 46, - 6, 1.1 ], [ 30, 26, .9 ], [ - 30, 26, 1 ], [ 4, - 22, 1 ], [ 40, 10, 1 ] ] ) {

		add( new THREE.CylinderGeometry( .25, .3, 2.4 * s, 6 ), pale, x, 1.2 * s + .1, z ); add( new THREE.IcosahedronGeometry( 2.2 * s, 2 ), pale, x, 3.4 * s + .1, z );

	}
	for ( const [ x, z ] of [ [ - 1.5, 14 ], [ 2, 16 ], [ 3.2, 22 ], [ - 2.5, 25 ], [ 8, 30 ] ] ) { add( new THREE.CapsuleGeometry( .38, 1.1, 4, 8 ), mid, x, 1.0, z ); add( new THREE.SphereGeometry( .32, 12, 8 ), mid, x, 2.05, z ); }
	for ( const x of [ - 8, 8 ] ) add( box( 3, .5, 1, .1 ), white, x, .5, 26 );

	// cloud: forms in the distance (back right), drifts until its shadow covers the solar roof, stays, thins out
	const cloud = new THREE.Group(); scene.add( cloud );
	for ( const [ x, y, z, r ] of [ [ - 4, 0, 0, 3.2 ], [ 0, 1, 1, 4 ], [ 4, 0, 0, 3 ], [ - 1, - .5, - 2.5, 2.8 ], [ 2, - .5, 3.5, 2.8 ] ] ) add( new THREE.SphereGeometry( r, 24, 16 ), white, x, y, z, { to: cloud } );
	const CLOUD = new THREE.CatmullRomCurve3( [ V( 14, 27, - 30 ), V( 7, 27, - 14 ), V( 1, 27, 2 ), V( - 1, 27, 5 ), V( - 3, 27, 8 ) ] );

	// drone with spinning rotors and a scan cone
	const drone = new THREE.Group(), rotors = [];
	add( box( 1.4, .45, 1.4, .15 ), black, 0, 0, 0, { to: drone } );
	for ( const [ x, z ] of [ [ 1, 1 ], [ - 1, 1 ], [ 1, - 1 ], [ - 1, - 1 ] ] ) {

		add( box( 1.6, .12, .14 ), black, x * .6, 0, z * .6, { to: drone, ry: Math.atan2( z, - x ) } );
		add( new THREE.CylinderGeometry( .75, .75, .04, 20 ), dark, x * 1.15, .2, z * 1.15, { to: drone } );
		const r = new THREE.Group(); r.position.set( x * 1.15, .25, z * 1.15 ); add( box( 1.5, .03, .16 ), black, 0, 0, 0, { to: r } ); drone.add( r ); rotors.push( r );

	}
	drone.scale.setScalar( 1.5 ); scene.add( drone );
	const DRONE_REST = PAD.clone().setY( PAD.y + .45 ), DRONE_LOOP = { y: BH + 6, rx: 15, rz: 9, w: .9 };
	const loopAt = a => V( Math.cos( a ) * DRONE_LOOP.rx, DRONE_LOOP.y, Math.sin( a ) * DRONE_LOOP.rz );
	const scan = new THREE.Mesh( new THREE.ConeGeometry( 2.6, 4.4, 32, 1, true ), fxMat( 0xffffff ) ); scan.material.side = THREE.DoubleSide;
	scene.add( scan );

	// the loop on the ground
	const RX = 50, RZ = 33, CY = .55;
	const at = a => V( Math.cos( a ) * RX, CY + .2, Math.sin( a ) * RZ );
	const pts = []; for ( let i = 0; i <= 200; i ++ ) pts.push( at( i / 200 * Math.PI * 2 ).setY( CY ) );
	add( new THREE.TubeGeometry( new THREE.CatmullRomCurve3( pts, true ), 400, .16, 6, true ), black, 0, 0, 0, { cast: false } );
	const markerAngles = [ Math.PI * .92, Math.PI * 1.2, Math.PI * 1.8, Math.PI * .1, Math.PI * .55 ];
	for ( let i = 0; i < 5; i ++ ) {

		let a0 = markerAngles[ i ], a1 = markerAngles[ ( i + 1 ) % 5 ]; if ( a1 < a0 ) a1 += Math.PI * 2; const am = ( a0 + a1 ) / 2;
		const p = at( am ), tan = at( am + .01 ).sub( at( am - .01 ) ).normalize();
		const cone = new THREE.Mesh( new THREE.ConeGeometry( .9, 2.2, 3 ), black ); cone.position.copy( p ); cone.quaternion.setFromUnitVectors( V( 0, 1, 0 ), tan ); scene.add( cone );

	}
	for ( const a of markerAngles ) { const p = at( a ); add( new THREE.CylinderGeometry( 1.7, 1.7, .5, 32 ), black, p.x, CY + .1, p.z, { cast: false } ); add( new THREE.CylinderGeometry( .8, .8, .55, 32 ), white, p.x, CY + .15, p.z, { cast: false } ); }

	// ---------- effects ----------
	const fx = new THREE.Group(); scene.add( fx );
	const ease = ( v, target, dt, rate = 4 ) => v + ( target - v ) * Math.min( 1, dt * rate );

	// expanding rings ("ping")
	const ringGeo = new THREE.TorusGeometry( 1, .07, 6, 64 ).rotateX( Math.PI / 2 );
	const pinger = ( p, r0, r1, period = 1.5, n = 2 ) => {

		const rings = Array.from( { length: n }, () => { const m = new THREE.Mesh( ringGeo, fxMat() ); m.position.copy( p ); fx.add( m ); return m; } );
		let k = 0;
		return { set level( v ) { k = v; }, get level() { return k; }, update( time ) {

			rings.forEach( ( m, i ) => {

				const u = ( time / period + i / n ) % 1;
				m.scale.setScalar( r0 + ( r1 - r0 ) * easeOut( u ) ); m.material.opacity = k * ( 1 - u ) * .9; m.visible = k > .01;

			} );

		} };

	};
	// dots running along a curve ("flow")
	const dotGeo = new THREE.SphereGeometry( 1, 10, 8 );
	const flow = ( curve, n, speed, r = .32 ) => {

		const mat = fxMat(), len = curve.getLength();
		const dots = Array.from( { length: n }, () => { const m = new THREE.Mesh( dotGeo, mat ); m.scale.setScalar( r ); fx.add( m ); return m; } );
		let k = 0;
		return { set level( v ) { k = v; }, get level() { return k; }, update( time ) {

			mat.opacity = k; dots.forEach( ( m, i ) => { m.visible = k > .01; m.position.copy( curve.getPointAt( ( i / n + time * speed / len ) % 1 ) ); } );

		} };

	};
	const pings = {
		sensor: pinger( sensor, .6, 5 ),
		roof: pinger( V( 0, BH + 2.6, 0 ), 2, 12, 1.8 ),
		battery: pinger( V( - 26, 4, 14.2 ), 1.5, 8, 1.6 ),
		home: pinger( at( markerAngles[ 0 ] ).setY( CY + .5 ), 1.8, 6, 1, 2 ),
	};
	const flows = {
		grid: flow( gridLine, 7, 9 ),
		solar: flow( new THREE.CatmullRomCurve3( [ V( - 12.5, BH + 1.4, 6.5 ), V( - 16, 10, 10.5 ), V( - 21, 6, 13 ), V( - 24, 4.4, 14 ) ] ), 6, 7, .42 ),
		charge: flow( new THREE.CatmullRomCurve3( [ V( - 20.4, .5, 18.6 ), V( - 6, .5, 21 ), V( 8, .5, 12.5 ), V( 19.6, .5, 13.3 ) ] ), 8, 9, .28 ),
	};
	// cool air pouring from the AC units down the front of the building
	const puffs = [];
	for ( let i = 0; i < 10; i ++ ) { const m = new THREE.Mesh( dotGeo, fxMat( 0xffffff ) ); m.userData = { x: 8 + ( i % 5 ) * .9, off: i / 10 }; fx.add( m ); puffs.push( m ); }
	let puffK = 0;
	// a bead that carries the result from step 5 back to step 1
	const bead = new THREE.Mesh( new THREE.SphereGeometry( 1.3, 20, 14 ), new THREE.MeshBasicMaterial( { color: 0xffffff } ) );
	bead.add( new THREE.Mesh( new THREE.SphereGeometry( 1.65, 20, 14 ), new THREE.MeshBasicMaterial( { color: 0x000000, side: THREE.BackSide } ) ) );
	fx.add( bead );

	// ---------- state over the steps ----------
	let step = 'perceive', t = 0, prev = '', evParked = false, droneAngle = Math.PI, batt = .4, fanSpin = 0;
	const dronePos = DRONE_REST.clone(), droneFrom = new THREE.Vector3();

	function setStep( k ) {

		if ( k === step ) return;
		prev = step; step = k; t = 0;
		if ( k === 'act' ) evParked = false;
		if ( prev === 'act' && k === 'feedback' ) evParked = true;
		droneFrom.copy( dronePos );

	}

	// the drone: rests on the pad, flies to the roof loop in "act", keeps scanning, lands during "feedback"
	function placeDrone( dt ) {

		let flying = false, scanning = false;
		if ( step === 'act' ) {

			flying = true;
			const lift = DRONE_REST.clone().setY( DRONE_REST.y + 5 ), start = loopAt( Math.PI );
			if ( t < .7 ) dronePos.lerpVectors( droneFrom, lift, smooth( t / .7 ) );
			else if ( t < 2 ) dronePos.copy( new THREE.QuadraticBezierCurve3( lift, V( - 22, DRONE_LOOP.y + 2, - 4 ), start ).getPoint( smooth( span( t, .7, 2 ) ) ) );
			else { droneAngle = Math.PI + ( t - 2 ) * DRONE_LOOP.w; dronePos.copy( loopAt( droneAngle ) ); scanning = true; }

		} else if ( step === 'feedback' && prev === 'act' ) {

			flying = t < 3.4;
			const hover = DRONE_REST.clone().setY( DRONE_REST.y + 5 );
			if ( t < 1 ) { dronePos.copy( loopAt( droneAngle + dt * DRONE_LOOP.w ) ); droneAngle += dt * DRONE_LOOP.w; scanning = true; droneFrom.copy( dronePos ); }
			else if ( t < 2.6 ) dronePos.copy( new THREE.QuadraticBezierCurve3( droneFrom, V( - 22, DRONE_LOOP.y + 2, - 4 ), hover ).getPoint( smooth( span( t, 1, 2.6 ) ) ) );
			else dronePos.lerpVectors( hover, DRONE_REST, smooth( span( t, 2.6, 3.4 ) ) );

		} else dronePos.lerp( DRONE_REST, Math.min( 1, dt * 3 ) );
		drone.position.copy( dronePos );
		drone.position.y += flying ? Math.sin( performance.now() / 380 ) * .15 : 0;
		rotors.forEach( r => r.rotation.y += ( flying ? 1 : 0 ) * dt * 40 );
		scan.material.opacity = ease( scan.material.opacity, scanning ? .35 : 0, dt, 6 );
		scan.visible = scan.material.opacity > .005;
		scan.position.copy( drone.position ).add( V( 0, - 2.4, 0 ) );
		if ( scanning ) for ( const p of panels ) if ( Math.hypot( p.position.x - dronePos.x, p.position.z - dronePos.z ) < 3.4 ) p.userData.lit = 1;
		for ( const p of panels ) { p.userData.lit = Math.max( 0, p.userData.lit - dt * .5 ); p.material.color.setScalar( .011 + p.userData.lit * .5 ); }

	}

	// the EV: drives in and plugs in during "act", charges through "feedback", leaves at the start of the next round
	function placeCar() {

		let visible = true, plugged = false;
		if ( step === 'act' ) {

			onRoute( IN, easeOut( span( t, 0, 4 ) ) ); plugged = t > 4.1;

		} else if ( step === 'feedback' ) { onRoute( IN, 1 ); plugged = true; } else if ( step === 'perceive' && evParked ) {

			if ( t < 1.8 ) onRoute( BACK, smooth( t / 1.8 ), true );
			else if ( t < 4.4 ) onRoute( OUT, easeIn( span( t, 1.8, 4.4 ) ) );
			else { visible = false; evParked = false; }

		} else visible = false;
		evCar.visible = visible; plug.visible = plugged;
		screens[ 1 ].material.color.setScalar( plugged && ( performance.now() / 500 | 0 ) % 2 ? 1 : 0 );

	}

	function update( dt, time ) {

		t += dt;
		rotor.rotation.z -= dt * .9;
		placeDrone( dt );
		placeCar();

		// cloud
		let u = 0, size = 1;
		if ( step === 'perceive' ) { u = 0; size = smooth( t / 1.6 ); } else if ( step === 'model' ) u = .83 * smooth( t / 3.4 );
		else if ( step === 'decide' ) u = .83 + .05 * clamp01( t / 4 ); else if ( step === 'act' ) u = .88 + .06 * clamp01( t / 6 );
		else { u = .94 + .06 * clamp01( t / 4 ); size = 1 - smooth( span( t, 1.5, 4 ) ); }
		cloud.position.copy( CLOUD.getPointAt( u ) ); cloud.scale.setScalar( Math.max( .001, size ) );

		// pings, flows, battery, AC
		const on = ( k, ...steps ) => steps.includes( step ) ? k : 0;
		pings.sensor.level = ease( pings.sensor.level, on( 1, 'perceive' ) || on( .6, 'feedback' ), dt );
		pings.roof.level = ease( pings.roof.level, on( .7, 'perceive' ), dt );
		pings.battery.level = ease( pings.battery.level, on( .8, 'perceive' ), dt );
		pings.home.level = ease( pings.home.level, step === 'feedback' && t > 2 ? 1 : 0, dt, 6 );
		flows.grid.level = ease( flows.grid.level, step === 'decide' || step === 'act' ? .12 : .85, dt, 2 );
		flows.solar.level = ease( flows.solar.level, on( 1, 'decide' ), dt );
		flows.charge.level = ease( flows.charge.level, ( step === 'act' && t > 4.1 ) || step === 'feedback' ? 1 : 0, dt );
		batt = ease( batt, step === 'decide' ? .4 + .38 * clamp01( t / 3.5 ) : step === 'act' ? .78 - .12 * clamp01( ( t - 4.1 ) / 3 ) : step === 'feedback' ? .66 : .4, dt, 3 );
		level.scale.x = 9 * batt;
		puffK = ease( puffK, on( 1, 'act' ), dt, 3 ); fanSpin = ease( fanSpin, puffK > .05 ? 14 : .6, dt, 2 );
		fans.forEach( f => f.rotation.y += dt * fanSpin );
		puffs.forEach( m => {

			const k = ( time / 2.2 + m.userData.off ) % 1;
			m.position.set( m.userData.x + Math.sin( k * 4 + m.userData.off * 20 ) * .4, BH + 1.6 - k * 9, BD / 2 + .9 + k * .8 );
			m.scale.setScalar( .35 + k * .7 ); m.material.opacity = puffK * Math.min( 1, k * 6 ) * ( 1 - k ) * .9; m.visible = puffK > .01;

		} );
		Object.values( pings ).forEach( p => p.update( time ) ); Object.values( flows ).forEach( f => f.update( time ) );

		// result running back from step 5 to step 1
		const a0 = markerAngles[ 4 ], a1 = markerAngles[ 0 ];
		bead.visible = step === 'feedback' && t < 2.4;
		bead.position.copy( at( a0 + ( a1 - a0 ) * smooth( span( t, .3, 2.1 ) ) ) ).setY( CY + 1.4 );

	}

	return { scene, camera, setStep, update, fx, get step() { return step; } };

}

// ---------- mount on the homepage ----------
function mount( root ) {

	const stage = root.querySelector( '.ld-stage' ), poster = stage && stage.querySelector( 'img.ld-scene' );
	if ( ! stage ) return;
	let renderer;
	try { renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true, powerPreference: 'low-power' } ); } catch ( e ) { return; }
	renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	renderer.setPixelRatio( Math.min( window.devicePixelRatio || 1, 2 ) );
	const canvas = renderer.domElement; canvas.className = 'ld-scene ld-live'; canvas.setAttribute( 'aria-hidden', 'true' );
	if ( poster ) poster.after( canvas ); else stage.prepend( canvas );

	const world = createLoopScene();
	world.setStep( root.dataset.step || 'perceive' );
	new MutationObserver( () => world.setStep( root.dataset.step ) ).observe( root, { attributes: true, attributeFilter: [ 'data-step' ] } );

	const size = () => { const w = stage.clientWidth, h = stage.clientHeight; if ( w && h ) { renderer.setSize( w, h, false ); world.camera.aspect = w / h; world.camera.updateProjectionMatrix(); } };
	new ResizeObserver( size ).observe( stage ); size();

	let visible = false, raf = 0, last = 0, time = 0, shown = false;
	const frame = now => {

		raf = 0;
		if ( ! visible || document.hidden ) return;
		const dt = last ? Math.min( .05, ( now - last ) / 1000 ) : 0; last = now; time += dt;
		world.update( dt, time );
		renderer.render( world.scene, world.camera );
		if ( ! shown ) { shown = true; stage.classList.add( 'is-live' ); }
		raf = requestAnimationFrame( frame );

	};
	const run = () => { if ( ! raf && visible && ! document.hidden ) { last = 0; raf = requestAnimationFrame( frame ); } };
	new IntersectionObserver( ( [ e ] ) => { visible = e.isIntersecting; run(); } ).observe( stage );
	document.addEventListener( 'visibilitychange', run );

}

const root = typeof document !== 'undefined' && document.querySelector( '[data-loop-diagram]' );
if ( root && ! window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches ) mount( root );
