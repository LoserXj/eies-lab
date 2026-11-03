// 主题注册表：新主题在 themes/<key>/ 下实现，再在这里登记一行。按需动态加载，只下载用到的主题。
export const THEMES = {
	pv: () => import( './pv/index.js' ),
};
export const DEFAULT_THEME = 'pv';
