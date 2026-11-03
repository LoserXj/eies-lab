import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

// 数据不进仓库。开发/预览时把本地数据根目录挂到 /scene-data/，与线上同源路径一致：
//   /scene-data/polyu/white_model/...   /scene-data/polyu/photoreal/...
// 数据根目录默认是网站仓库旁边的 Desktop/data，可用环境变量 SCENE_DATA_ROOT 改。
const DATA_ROOT = path.resolve( process.env.SCENE_DATA_ROOT || path.join( __dirname, '../../data' ) );
const PREFIX = '/scene-data/';
const MIME = {
	'.json': 'application/json',
	'.geojson': 'application/geo+json',
	'.b3dm': 'application/octet-stream',
	'.csv': 'text/csv',
};

function serveData( req, res, next ) {

	if ( ! req.url || ! req.url.startsWith( PREFIX ) ) return next();
	const rel = decodeURIComponent( req.url.slice( PREFIX.length ).split( '?' )[ 0 ] );
	const file = path.resolve( DATA_ROOT, rel );
	if ( ! file.startsWith( DATA_ROOT + path.sep ) ) return next();
	fs.stat( file, ( err, st ) => {

		if ( err || ! st.isFile() ) {

			res.statusCode = 404;
			return res.end();

		}
		res.setHeader( 'Content-Type', MIME[ path.extname( file ) ] || 'application/octet-stream' );
		res.setHeader( 'Content-Length', st.size );
		res.setHeader( 'Cache-Control', 'public, max-age=3600' );
		fs.createReadStream( file ).pipe( res );

	} );

}

export default defineConfig( {
	// 相对路径：构建产物放在网站任意子路径下都能用（线上为 /scenes/）
	base: './',
	build: {
		target: 'es2022',
		// 构建进 Hugo 的 static/，随网站一起发布到 /scenes/
		outDir: path.resolve( __dirname, '../static/scenes' ),
		emptyOutDir: true,
		// three.js 单独成块（约 700 kB），各主题共用、长期缓存
		chunkSizeWarningLimit: 800,
		rollupOptions: { output: { manualChunks: { three: [ 'three' ] } } },
	},
	server: { port: 5180, strictPort: true, cors: true },
	preview: { port: 5181 },
	plugins: [ {
		name: 'scene-data',
		configureServer( server ) {

			server.middlewares.use( serveData );

		},
		configurePreviewServer( server ) {

			server.middlewares.use( serveData );

		},
	} ],
} );
