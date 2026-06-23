# GLIDE · Project Demo Page

> 全球移民动态监测系统（GLIDE）官方项目演示页面。

## 关于本仓库

本仓库**仅包含演示页面静态资源**，由 [GmwRadar / GLIDE 主仓库](https://github.com/WYHCIPUC/GmwRadar) 中的 `docs/demo/` 同步而来，部署在 GitHub Pages 上，用于展示 GLIDE 项目的核心能力与视觉风格。

主项目仓库保持私有，本仓库为公开演示入口。

## 在线演示

🌐 https://wyhcipuc.github.io/glide-demo/

## 内容结构

```text
├── index.html        # 主页面（指挥中心 / 四视图 / 实时情报流 / 可视化 / 架构 / 系统状态）
├── css/demo.css      # 深空黑科技风样式（与主仓库 web/css/base.css 设计令牌一致）
├── js/
│   ├── radar.js      # ECharts 世界地图 + 雷达扫描 + 粒子动效 + 漂移循环
│   ├── charts.js     # 雷达 / 趋势 / 国家 / 渠道 / AI 调用 5 类图表
│   └── demo.js       # 导航 / 滚动揭示 / 计数动画 / 标签页 / 实时情报流滚动
├── assets/
│   ├── logo.svg      # GLIDE 雷达图标
│   └── favicon.svg
└── data/world.json   # ECharts 世界地图 GeoJSON（1MB）
```

## 设计理念

- **深空黑科技风**：青发 `#00ffff` / 翠绿 `#00d992` / 暗夜紫 `#a855f7`
- **HUD 航空仪表盘**：四角支架、毛玻璃、药丸形标签、JetBrains Mono 等宽字体
- **三层 Hero 动效**：ECharts 漂移世界地图 + Canvas 雷达扫描 + Canvas 粒子
- **真实数据纹理**：4 决策卡、5 实时情报流、5 可视化图表均模拟 GLIDE 真实运行场景

## 同步策略

由主仓库 `docs/demo/` 单向同步到此仓库的 `main` 分支。同步方式：

```bash
# 在主仓库根目录
rsync -av --delete docs/demo/ .tmp/glide-demo/
cd .tmp/glide-demo
git add -A
git commit -m "sync: 同步 docs/demo 最新内容"
git push origin main
```

## License

演示页面基于主仓库 [GPL-3.0](https://github.com/WYHCIPUC/GmwRadar/blob/main/LICENSE) 同步发布。
