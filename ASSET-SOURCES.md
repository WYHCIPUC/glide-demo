# 境鉴展厅资源来源

内容版本：2026-09-28.3。运行资源全部随站发布，无远程字体、脚本或业务接口依赖。

## 正式品牌资产

- 首屏与结尾使用境鉴 G21 正式低金属深色标志。原始海报与循环视频分别为 `jingjian-ui-satin-g21-loop-poster.png`、`jingjian-ui-satin-g21-loop-24s-4k.webm`，来自现行正式品牌资产。
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
26f5f117b0b04aaa2977ddca013c472139884d31efdf0ef07b175ad0d7dcd780  assets/fonts/jingjian-sans.woff2
92bb9a96476f983d212a2bc4f54c889039c1696dd4461d40a736860938570fbb  vendor/gsap.min.js
b0b14d67b55b0c43c756ac0b106cfcb09d0879945f6ead64451065b0672916a2  vendor/ScrollTrigger.min.js
53195c9797e7ce7bf9d7fa9242b08209e57f46de4c9dac126a6494fa780e3346  vendor/lenis.min.js
```
