# scenes · 首页三维背景

网站首页 Hero 背后的实时三维场景（three.js + 3D Tiles）。来自原 `Desktop/data/embodied-bg`，拆成"内核 / 场地 / 主题"三层，以后加新主题只动 `themes/<key>/`。

首页通过 iframe 嵌入（区块 `hero-scene`，见 `layouts/_partials/hbx/blocks/hero-scene/`），彼此隔离：场景的依赖、样式、全屏 canvas 不影响 Hugo 主题。

## 目录

```
scenes/
├─ index.html            HUD 样式（full / lite / off 三种模式）
├─ vite.config.js        开发时挂载数据；构建输出到 ../static/scenes/
├─ public/basis/         KTX2 纹理解码器
└─ src/
   ├─ main.js            入口：读参数 → 选场地与主题 → 舞台 → 主题 setup → 主循环
   ├─ core/              与主题无关
   │  ├─ params.js       URL 参数
   │  ├─ stage.js        渲染器、相机、灯光、实景瓦片、白模、扫描几何；主循环、暂停、宿主消息
   │  ├─ timeline.js     幕时间线工具 + 实验室闭环五步 LOOP_STEPS
   │  ├─ city.js         白模：读 GeoJSON、挤出楼体、线框、屋顶面
   │  ├─ fx.js           无人机、扫描扇面、点云、太阳、能量枢纽与能量流
   │  ├─ hud.js          闭环进度、锚定标签、数据署名；addCard() 给主题加卡片
   │  ├─ reveal.js       白模 ↔ 实景扫描揭幕着色器
   │  └─ geo.js          WGS84 → 本地坐标、太阳位置
   ├─ places/            场地：在哪里、数据在哪（polyu.js；index.js 注册）
   └─ themes/            研究主题（index.js 注册，按需加载）
      └─ pv/             城市光伏：acts.js 六幕、solar.js 屋顶日照、panels.js 光伏板、cards.js 色标与曲线、index.js 每帧逻辑
```

## 本地开发

在网站根目录：

```bash
pnpm install          # 一次即可（pnpm workspace，scenes 是其中一个包）
pnpm scenes:dev       # 场景开发服务器 http://localhost:5180/
hugo server           # 网站 http://localhost:1313/，首页 Hero 自动从 5180 加载场景
```

- 数据不进仓库。开发服务器把数据根目录挂到 `/scene-data/`，默认是网站仓库旁边的 `Desktop/data`（里面有 `polyu/`）；换位置用 `SCENE_DATA_ROOT=/path/to/data pnpm scenes:dev`。
- 场景开发服务器没开时，首页只显示海报图，不报错。
- 单独调场景：`http://localhost:5180/?theme=pv&act=3`（参数见下）。

## 构建与部署

```bash
pnpm build            # = pnpm scenes:build（→ static/scenes/）+ hugo --minify + pagefind
```

`static/scenes/` 是构建产物，已加入 `.gitignore`。服务器上同源部署：

| 路径 | 内容 |
|---|---|
| `/` | Hugo 生成的网站（`public/`），其中包含 `/scenes/` |
| `/scene-data/polyu/` | `Desktop/data/polyu/` 整个目录（白模 + 实景瓦片，约 1.6 GB） |

场景地址由 `config/_default/params.yaml` 的 `scenes.src` 决定（线上 `/scenes/`，开发时 `config/development/params.yaml` 改成 5180）。数据目录默认 `/scene-data/<place>/`，可用 `?data=` 覆盖。

建议给 `/scene-data/` 配长缓存（例如 nginx `expires 30d;`）：瓦片会随视角反复按需加载，有缓存时只从本地取。完整播放一轮约下载 100 MB 瓦片。

## URL 参数

| 参数 | 作用 |
|---|---|
| `theme=pv` | 研究主题 |
| `place=polyu` | 场地 |
| `act=N` | 定格在第 N 幕循环（旧名 `scene=N` 仍可用） |
| `hud=full\|lite\|0` | 全部标注 / 只留右下闭环进度与署名（首页用）/ 只留署名 |
| `lang=en\|zh` | 幕标题语言 |
| `dim=0..1` | 整体压暗 |
| `shift=0..0.5` | 画面主体右移的比例，给左侧文字让位（首页默认 0.18） |
| `speed=1` | 播放速度 |
| `data=URL` | 数据目录 |

## 与宿主页面通信

```js
frame.contentWindow.postMessage( { type: 'lab-scene', act: 3 }, '*' );     // 定格第 3 幕；act: null 恢复循环
frame.contentWindow.postMessage( { type: 'lab-scene', paused: true }, '*' ); // 暂停渲染（首页滚出视口时自动发）
```

场景就绪或失败时会通知宿主：`{ type: 'lab-scene', event: 'ready' | 'error' }`，首页据此把海报淡出成实时画面。

## 加一个新主题

1. 新建 `src/themes/<key>/`，`index.js` 默认导出：

   ```js
   export default {
   	key: 'storage',
   	name: { en: 'Buildings & storage', zh: '建筑与储能' },
   	acts: ACTS,                 // [{ key, dur, step, title: { en, zh } }]，step 取 LOOP_STEPS 的 key 或 null
   	async setup( ctx ) {        // ctx：scene、camera、city、C、pointOn、reveal、hud、toScreen、place …（见 core/stage.js）
   		// 往 ctx.scene 里加东西
   		return { update( loc, time ) { /* loc = { i, p, t, act }，每帧按时间设置画面 */ } };
   	},
   };
   ```

2. 在 `src/themes/index.js` 登记：`storage: () => import( './storage/index.js' )`。
3. 本地看效果：`http://localhost:5180/?theme=storage`。
4. 生成海报：浏览器控制台运行 `__scene.capture( 幕序号, 0..1 )`，下载的 JPG 放到 `assets/media/scenes/<theme>-<place>.jpg`。如果首页用了 `shift`，海报要按同样比例右移（或带 `&shift=` 打开再截）。
5. 首页切换：`content/_index.md` 与 `_index.zh.md` 的 `scene.theme` / `scene.poster`。

新场地同理：`src/places/<key>.js`（原点、数据文件、署名），在 `places/index.js` 登记，数据放到 `/scene-data/<key>/`。

## 数据署名

建筑与实景三维数据来自香港地政总署，校园标注来自香港理工大学（详见数据目录 `provenance/`）。署名由场地配置提供，HUD 在任何模式下都会显示。
