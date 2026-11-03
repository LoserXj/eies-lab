// 场地：理大红磡校园。只描述"在哪里、数据在哪"，不含任何研究主题的逻辑。
// 数据目录结构见 Desktop/data/polyu/README.md；部署时与场景代码同源，放在 /scene-data/polyu/。

export default {
	key: 'polyu',
	name: { en: 'PolyU Hung Hom campus', zh: '香港理工大学红磡校园' },
	origin: { lat: 22.3035, lon: 114.1799 },
	files: {
		campus: 'white_model/polyu-official-campus.geojson',
		context: 'white_model/polyu-official-context.geojson',
		tiles: 'photoreal/hk3d-local/tileset.json',
	},
	// 扫描方向：西南 → 东北（弧度，从东向北起算的反方向）
	scanAngle: Math.PI / 6,
	credit: 'Data: Lands Department, HKSAR · PolyU',
};
