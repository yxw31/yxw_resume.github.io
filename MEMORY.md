# 项目记忆

生成时间：2026-07-08  
工作目录：`F:\6Project_App\5personal_page`

## 项目定位

这是袁修玮的个人作品集静态站，项目名见 `package.json`：`yxw-personal-page`。站点是数据驱动、中英双语、支持深色/浅色主题的纯前端项目，主站内容主要来自 `data/00_site.json` 到 `data/10_contact.json`，页面由 `js/render.js` 动态渲染。

本项目还包含独立的 `/notes/` 知识库子站，Markdown 笔记位于 `notes/content/`，索引文件 `data/51_notes-index.json` 由 `tools/build-notes.js` 生成。知识库有客户端密码门，但它不是加密保护，不应放真正敏感内容。

## 当前结构概览

根目录主要文件：

- `index.html`：主站首页骨架，主体 section 容器由 JS 填充。
- `README.md`：项目说明与维护手册，信息很完整。
- `package.json`：仅含少量脚本，无复杂依赖声明。
- `Resume.pdf`：联系区下载简历使用。
- `css/style.css`：主站设计系统与通用布局。
- `css/notes.css`：知识库页面样式。
- `js/`：所有页面渲染与交互逻辑。
- `data/`：主站与知识库的结构化内容。
- `notes/`：知识库 HTML 壳与 Markdown 内容。
- `projects/project.html`：项目详情页骨架。
- `tools/`：笔记索引构建与知识库密码哈希更新脚本。
- `images/`：站点头像、hero、项目、生活等图片素材。

本次扫描时，除 `.git` 外约 88 个文件：图片最多，其次是 JSON、JS、Markdown、HTML、CSS。

## 运行与维护命令

- 本地预览：`npm run dev`
- 等价预览命令：`npx http-server -p 8131 -c-1`
- 构建知识库索引：`npm run build:notes`
- 修改知识库密码哈希：`npm run set:password -- <new-password>`

站点通过浏览器 `fetch` 读取 JSON 和 Markdown，不能直接双击 HTML 预览，必须通过 HTTP 服务打开，默认地址是 `http://localhost:8131/`。

## 数据编辑规则

主站内容优先改 `data/*.json`，通常不要改 HTML：

- `data/00_site.json`：站点标题、描述、logo、导航、页脚、默认语言和主题。
- `data/01_hero.json`：首屏姓名、头衔、简介、hero 轮播图、核心方向、CTA。
- `data/02_about.json`：关于我、信息卡、头像。
- `data/03_education.json`：教育经历。
- `data/04_experience.json`：实习经历。
- `data/05_projects.json`：项目卡片与详情页内容。
- `data/06_activities.json`：学生工作。
- `data/07_skills.json`：技能分类。
- `data/08_publications.json`：奖学金、竞赛与荣誉。
- `data/09_life.json`：生活板块、兴趣、生活照轮播。
- `data/10_contact.json`：联系方式与简历下载按钮。

中英双语字段可写普通字符串，也可写 `{ "zh": "...", "en": "..." }`。渲染器会按当前语言取值，缺失时回退到另一种语言。

## 主要前端逻辑

- `js/render.js`：主站核心渲染器。提供 `window.KL` 公共工具，包括 `loadJSON`、`t`、`esc`、`renderSite`、`setLanguage` 等。它加载 00-10 号 JSON，渲染首页各板块，并触发 `content:loaded` / `lang:changed` 事件。
- `js/main.js`：主题切换、语言切换、移动端菜单、scrollspy、渐入动画。语言切换后会重新绑定动态 DOM。
- `js/render-project.js`：读取 URL 的 `?id=`，从 `data/05_projects.json` 匹配项目并渲染详情页。
- `js/render-notes-list.js`：知识库首页渲染，加载 `50_notes-meta` 和 `51_notes-index`，支持搜索、分类卡片、标签筛选。
- `js/render-note.js`：单篇 Markdown 笔记渲染，支持 frontmatter、marked、highlight.js、KaTeX、目录、复制代码、图片 lightbox、阅读进度、上一篇/下一篇和相关推荐。
- `js/notes-gate.js`：知识库登录页逻辑，使用 `SHA-256(salt + password)` 与 `data/52_notes-gate.json` 中的 hash 对比，解锁状态写入 localStorage/sessionStorage。

## 知识库记忆

知识库分类来自 `data/50_notes-meta.json`：

- `motor-control`：电机控制，当前有 FOC 和 LADRC 笔记。
- `domain-control`：域控制开发，当前有 AURIX TC387 上手避坑。
- `deep-learning`：深度学习，当前有时序模型对比。
- `automotive-security`：车辆安全，当前有 GPS 欺骗入门。
- `tools`：工具技巧，当前有 VS Code 写 Markdown 提效插件。
- `papers`：文献资料，当前分类存在但本次索引里暂无笔记。

新增或修改 Markdown 后，必须运行 `npm run build:notes` 以更新 `data/51_notes-index.json`。不要手工编辑 `data/51_notes-index.json`，它是生成物。

Markdown frontmatter 至少应包含：

```markdown
---
title: 标题
date: 2026-05-31
updated: 2026-05-31
category: motor-control
tags: [tag1, tag2]
summary: 一句话摘要
draft: false
---
```

## 样式记忆

`css/style.css` 定义了 Kinetic Ledger 风格的设计系统：

- 主色是橙色 accent：`--accent: 25 95% 53%`。
- 默认 token 包含 dark/light 两套主题。
- 主要字体：`Inter` 和 `JetBrains Mono`。
- 最大内容宽度：`--max-width: 1100px`。
- 导航栏固定高度：`--nav-height: 64px`。

`css/notes.css` 继承主站 token，额外定义知识库 hero、搜索框、分类卡片、笔记列表、单篇阅读页、TOC、代码块、密码门等样式。

## 当前内容重点

站点主人设定：北京理工大学车辆工程硕士在读，方向包括电机控制算法、混合动力域控制、深度学习、智能网联与车规级端侧部署。项目包括混合动力域控制策略、智能网联汽车网络安全、GPS 欺骗实践、无人驾驶方程式赛车传动设计等。

联系与简历入口存放在 `data/10_contact.json`，简历按钮当前指向 `Resume.pdf`。

## 注意事项

- 本次扫描前已有用户改动：`data/01_hero.json` 处于 modified 状态。后续不要无意覆盖它。
- 知识库密码门是客户端门禁，不是真加密；不要把敏感内容仅靠它保护。
- 修改 `.md` 后记得构建索引；修改 JSON 后通常硬刷新浏览器即可。
- Windows PowerShell 读取中文文件时建议显式使用 UTF-8，例如：

```powershell
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
Get-Content -Raw -Encoding UTF8 README.md
```

- 当前环境里 `rg --files` 曾出现 `Access is denied`，需要时可用 PowerShell `Get-ChildItem -Recurse` 替代。
