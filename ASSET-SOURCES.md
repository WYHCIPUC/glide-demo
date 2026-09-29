# 境鉴展厅资源来源

## 透光玻璃概念图

- `assets/optic-study.webp`：2026-09-29 使用内置 imagegen 生成的原创概念素材，1536 × 1024。三层玻璃用于表达从信息到理解的阅读过程，不是系统截图、业务证据或品牌标志。
- 原始生成 PNG 保留在生成工具默认目录；以 FFmpeg `libwebp`、quality 86、compression_level 6 转为 43,622 字节 WebP，保留完整画幅。白色摄影棚背景属于概念图，不加入正式 G21 透明标志。
- 最终提示词：

```text
Use case: stylized-concept. Asset type: original editorial visual for Jingjian, a Guangzhou-based global migration intelligence platform, used between a city introduction and its evidence-led research chapters. Create a premium architectural still life of exactly three tall, thin rectangular optical-glass panels arranged sequentially in deep perspective, upright on a pale cool-silver matte floor. Each panel transmits the same narrow line of soft ice-blue light; the nearest panel is optically clear, farther panes are delicately frosted. This is a visual metaphor for information being clarified into understanding. Large rectangular panes, not rings, spheres, globes, cards, arrows, brains or interface screens. Physical restraint, tactile milky glass edges, subtle cyan caustics, realistic broad studio daylight, clean shadows. A contemporary design museum catalogue photograph / high-end product photography quality, sober and exquisite rather than shiny metal sci-fi. Palette cool white, mist-silver, barely blue transparent glass, restrained midnight-blue shadows. Wide landscape 3:2 composition: main panes occupy the center-right, generous calm pale negative space to the left; everything completely visible inside frame with margin. No text, no lettering, no logo, no maps, no country silhouettes, no data, no people, no labels, no watermark. Opaque pale studio background. Photorealistic materials, crisp antialiased edges, smooth natural transitions, ultra-clean high resolution.
```

内容版本：2026-09-29.1。运行资源全部随站发布，无远程字体、脚本或业务接口依赖。

## 正式品牌资产

- 项目品牌展陈与结尾使用境鉴 G21 正式低金属深色标志。原始海报与循环视频分别为 `jingjian-ui-satin-g21-loop-poster.png`、`jingjian-ui-satin-g21-loop-24s-4k.webm`，来自现行正式品牌资产。
- 网页海报缩放为 1024 × 1024 无损透明 WebP；循环视频缩放为 1024 × 1024、VP9 Alpha、30 帧/秒、24 秒，保留原有地图自转、轮廓、材质与内部深色填充。网页文件是轻量派生件，不替代 4K 品牌母版。
- 导航图标由同一正式透明海报缩放为 128 像素；既有分享图、标志与地图文件保留兼容，不重新绘制品牌。
- 原始资产不向网站添加附加地球、标题或背景。播放失败、减少动态、禁用脚本时显示同形静态标志。

海报使用 Pillow 的 LANCZOS 缩放与无损 WebP；视频使用 FFmpeg `libvpx-vp9` 解码和编码，`scale=1024:1024:flags=lanczos`、`-pix_fmt yuva420p -crf 32 -b:v 0 -auto-alt-ref 0`。网页另以同形海报的 Alpha 遮罩约束视频外缘，消除有损编码在纯透明区域的微小 Alpha 噪声。

## 字体

- 来源：[Google Fonts / Noto Sans SC](https://github.com/google/fonts/tree/main/ofl/notosanssc)，SIL Open Font License 1.1，完整许可随 `assets/fonts/OFL.txt` 发布。
- 原字体文件：`NotoSansSC[wght].ttf`，Git blob `fb0637bafbcd804fe32152370a1225990745b4bc`。
- 由 fontTools 按本站文字、基础拉丁字符与控制按钮文字生成 WOFF2 子集，内部字体名称改为 `Jingjian Sans`，保留可变字重。它是 Noto Sans SC 的网站子集，不是另行设计的原创品牌字体。
- `font-display: swap`，未加载字形或字体失败时回退到思源黑体、Noto Sans SC、微软雅黑及系统无衬线字体。内容改动后应更新子集。

## 动效库

- [GSAP 3.15.0](https://www.npmjs.com/package/gsap)：只使用核心和 ScrollTrigger；保留原始压缩文件许可头以及 `vendor/GSAP-README.md`，适用 [GSAP 标准许可](https://gsap.com/community/standard-license/)。本项目是终端展示网站，不提供可视化动效编辑器。
- [Lenis 1.3.26](https://www.npmjs.com/package/lenis)：MIT，完整许可为 `vendor/LENIS-LICENSE.txt`。仅桌面精细指针环境增强滚动；触屏、窄屏、减少动态时使用原生滚动。
- 两项均从 npm 官方 registry 通过 `npm pack --ignore-scripts` 获取，无安装脚本或新增运行时依赖。发布前核验 tarball SHA-512：

```text
gsap-3.15.0.tgz  sha512-dMW4CWBTUK1AEEDeZc1g4xpPGIrSf9fJF960qbTZmN/QwZIWY5wgliS6JWl9/25fpTGJrMRtSjGtOmPnfjZB+A==
lenis-1.3.26.tgz sha512-s/xTCZCxTFvHbAN1OzuhNaN5YPJH2ail0XAkctKW1b+RUAG4nUL5UHLXwNko1h8aEeT2jspBXegMgPJd8zcuag==
```

既有 ECharts 许可与声明保留在 `vendor/LICENSE.txt`、`vendor/NOTICE.txt`。新增第三方文件由 `.gitattributes` 保留原始换行和许可中的空白，不做格式改写。新页面不再加载旧雷达/粒子背景脚本；图表示例继续使用原有演示数据。

## 本次新增主要文件 SHA-256

```text
748bbff7f2f8ca93ff8c785d2bc06d8929d757d6a9e41e71fd17024943a18684  assets/jingjian-ui-satin-loop.webm
fba60e917c9fab980383c9fd296745db705c0b4268fd23154100831c12a6389a  assets/jingjian-ui-satin-poster.webp
1757ecb94b180c00253679e14ed93e4ace4d17e09d2e1e6224ed01bb8abb8e9d  assets/fonts/jingjian-sans.woff2
420d04c629ba6a1c320768b43e868cb16e88f1883b09b73d8ad5a49f931f8c11  assets/guangzhou-night.webp
4344e9f2d17fb3329dd804bbaac36cb6951ddb4154f551eddd6b2121b6460ee5  assets/optic-study.webp
92bb9a96476f983d212a2bc4f54c889039c1696dd4461d40a736860938570fbb  vendor/gsap.min.js
b0b14d67b55b0c43c756ac0b106cfcb09d0879945f6ead64451065b0672916a2  vendor/ScrollTrigger.min.js
53195c9797e7ce7bf9d7fa9242b08209e57f46de4c9dac126a6494fa780e3346  vendor/lenis.min.js
```

## 广州城市主视觉

- `assets/guangzhou-night.webp` 为 2026-09-28 使用内置 imagegen 生成的城市品牌概念图，1916 × 821；不是项目采集的照片、具体地理视点或业务证据。图中不承载地图边界、事件和监测数值。
- 原始生成件保留在生成工具默认目录；网站保存选定的完整画面，使用 FFmpeg `libwebp`、quality 84、compression_level 6 转为 87,414 字节 WebP，无重绘、无裁切。浏览器依屏幕尺寸使用 object-fit 展示。
- 正式 G21 标志与城市概念图分别作为独立资源展示，未把城市背景烘焙进品牌透明文件。
- 最终生成提示词（内置工具模式）：

```text
Use case: stylized-concept. Asset type: immersive full-bleed 21:9 brand website hero artwork for Jingjian, a Guangzhou-based global migration intelligence platform. Create an original cinematic architectural art photograph of Guangzhou's Pearl River after dusk, with a faithfully recognizable slender twisted lattice Canton Tower on the right third, viewed from across the wide dark river. Modern skyline recedes into deep midnight haze; calm dark reflective water foreground. Art-directed, spacious, arresting composition: left half mostly near-black negative space with only a very subdued low horizon so large white Chinese typography can be overlaid in code. Tower occupies right 30 percent of image, cyan illumination refined and sparse, not rainbow; silver-blue city reflections. Crisp architectural silhouette but subtle film-like atmosphere, blue-black, restrained ice cyan and a few warm window lights. Feels like a cultural architecture exhibition cover, not a cyberpunk game, sci-fi control room or real surveillance scene. Wide landscape at highest available resolution, ideally 2560x1440 or wider. No text, no logo, no lettering, no HUD, no dots, no globe, no map, no grid lines, no arrows, no people, no watermark. This is a conceptual city illustration not documentation of an exact real viewpoint.
```
