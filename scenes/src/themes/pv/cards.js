// 光伏主题的 HUD 卡片：日照色标（世界模型 / 推演）与预测 vs 实测曲线（反馈）。

export function makePvCards( hud ) {

	const legend = hud.addCard( 'hud-legend', `
		<div class="hud-card-head"><b class="lg-title"></b><span class="lg-clock"></span></div>
		<div class="lg-bar"></div>
		<div class="lg-ticks"><span>Low</span><span>High</span></div>` );
	const chart = hud.addCard( 'hud-chart', `
		<div class="hud-card-head"><b>Predicted vs Measured</b></div>
		<canvas width="600" height="250"></canvas>` );
	const ctx = chart.querySelector( 'canvas' ).getContext( '2d' );

	// 色标：hour 为 null 时显示全年潜力，否则显示推演中的瞬时辐照与时刻
	function setLegend( opacity, hour ) {

		legend.style.opacity = opacity.toFixed( 3 );
		if ( opacity < 0.01 ) return;
		legend.querySelector( '.lg-title' ).textContent = hour === null ? 'Solar Potential' : 'Rollout';
		const clock = legend.querySelector( '.lg-clock' );
		if ( hour === null ) clock.textContent = '';
		else if ( hour < 6 || hour > 18.2 ) clock.textContent = 'Night';
		else {

			const h = Math.floor( hour ), m = Math.floor( ( hour - h ) * 4 ) * 15;
			clock.textContent = `${String( h ).padStart( 2, '0' )}:${String( m ).padStart( 2, '0' )}`;

		}

	}

	// 预测 vs 实测（示意）：progress 控制实测曲线绘制进度，learn 控制预测向实测收敛、区间收窄
	const gauss = ( h, c, w ) => Math.exp( - ( ( ( h - c ) / w ) ** 2 ) );
	const meas = h => Math.pow( Math.max( 0, Math.sin( Math.PI * ( h - 6.3 ) / 11.4 ) ), 1.3 ) *
		( 1 - 0.24 * gauss( h, 13.4, 0.55 ) - 0.13 * gauss( h, 10.2, 0.4 ) );
	const prior = h => Math.pow( Math.max( 0, Math.sin( Math.PI * ( h - 6 ) / 12 ) ), 1.1 ) * 1.04;

	function drawChart( opacity, progress, learn ) {

		chart.style.opacity = opacity.toFixed( 3 );
		if ( opacity < 0.01 ) return;
		const W = 600, H = 250, L = 18, Rr = 18, T = 14, B = 34;
		const X = h => L + ( W - L - Rr ) * ( h - 6 ) / 12;
		const Y = v => H - B - ( H - T - B ) * v * 0.92;
		const pred = h => prior( h ) * ( 1 - learn ) + meas( h ) * learn;
		const band = h => ( 0.13 * ( 1 - learn ) + 0.03 ) * Math.max( 0.15, prior( h ) );
		const N = 120, hs = Array.from( { length: N + 1 }, ( _, i ) => 6 + 12 * i / N );
		ctx.clearRect( 0, 0, W, H );

		// 刻度
		ctx.font = '500 17px ui-monospace, Menlo, monospace';
		ctx.fillStyle = 'rgba(200,216,235,0.45)';
		ctx.textAlign = 'center';
		[ 6, 9, 12, 15, 18 ].forEach( h => {

			ctx.fillText( String( h ).padStart( 2, '0' ), X( h ), H - 8 );
			ctx.fillRect( X( h ) - 0.5, H - B + 4, 1, 5 );

		} );
		ctx.fillStyle = 'rgba(160,190,220,0.18)';
		ctx.fillRect( L, H - B, W - L - Rr, 1 );

		// 预测区间
		ctx.beginPath();
		hs.forEach( ( h, i ) => i ? ctx.lineTo( X( h ), Y( pred( h ) + band( h ) ) ) : ctx.moveTo( X( h ), Y( pred( h ) + band( h ) ) ) );
		for ( let i = N; i >= 0; i -- ) ctx.lineTo( X( hs[ i ] ), Y( Math.max( 0, pred( hs[ i ] ) - band( hs[ i ] ) ) ) );
		ctx.closePath();
		ctx.fillStyle = 'rgba(127,233,255,0.12)';
		ctx.fill();

		// 实测：渐变填充 + 线 + 发光端点
		const upto = Math.max( 1, Math.floor( N * progress ) );
		const grd = ctx.createLinearGradient( 0, T, 0, H - B );
		grd.addColorStop( 0, 'rgba(255,211,107,0.38)' );
		grd.addColorStop( 1, 'rgba(255,211,107,0)' );
		ctx.beginPath();
		ctx.moveTo( X( 6 ), Y( 0 ) );
		for ( let i = 0; i <= upto; i ++ ) ctx.lineTo( X( hs[ i ] ), Y( meas( hs[ i ] ) ) );
		ctx.lineTo( X( hs[ upto ] ), Y( 0 ) );
		ctx.closePath();
		ctx.fillStyle = grd;
		ctx.fill();
		ctx.beginPath();
		for ( let i = 0; i <= upto; i ++ ) i ? ctx.lineTo( X( hs[ i ] ), Y( meas( hs[ i ] ) ) ) : ctx.moveTo( X( hs[ i ] ), Y( meas( hs[ i ] ) ) );
		ctx.strokeStyle = 'rgba(255,211,107,0.95)';
		ctx.lineWidth = 3;
		ctx.lineJoin = 'round';
		ctx.stroke();

		// 预测线
		ctx.beginPath();
		hs.forEach( ( h, i ) => i ? ctx.lineTo( X( h ), Y( pred( h ) ) ) : ctx.moveTo( X( h ), Y( pred( h ) ) ) );
		ctx.strokeStyle = 'rgba(127,233,255,0.9)';
		ctx.lineWidth = 2;
		ctx.setLineDash( [ 2, 6 ] );
		ctx.lineCap = 'round';
		ctx.stroke();
		ctx.setLineDash( [] );

		if ( progress > 0 && progress < 1 ) {

			const hx = X( hs[ upto ] ), hy = Y( meas( hs[ upto ] ) );
			const g = ctx.createRadialGradient( hx, hy, 0, hx, hy, 16 );
			g.addColorStop( 0, 'rgba(255,230,160,1)' );
			g.addColorStop( 1, 'rgba(255,211,107,0)' );
			ctx.fillStyle = g;
			ctx.fillRect( hx - 16, hy - 16, 32, 32 );

		}


	}

	return { setLegend, drawChart };

}
