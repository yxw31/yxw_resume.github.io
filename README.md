<!--
  README — 袁修玮 个人作品集 / Yuan Xiuwei Personal Portfolio
  双语文档 Bilingual (中文 / English)
-->

# 袁修玮 · 个人作品集 / Personal Portfolio

> **中文** ｜ [English](#english-version)
>
> 一个数据驱动、中英双语、支持深色/浅色主题的静态个人作品集网站。
> A data-driven, bilingual (zh/en), dark/light-themed static personal portfolio website.

---

## 中文版

### 一、项目简介

这是一个**纯静态、数据驱动**的个人作品集网站。所有展示内容都集中在 `data/` 目录下的 JSON 文件中，页面由 `js/` 中的渲染脚本动态生成。

> **核心理念：修改内容只需编辑 `data/*.json`，无需改动 HTML / JS。**

主要特性：

- **数据驱动**：内容与代码分离，全部文案在 JSON 里维护。
- **中英双语**：任意文案字段都可以写成普通字符串，或写成 `{ "zh": "...", "en": "..." }` 对象，点击导航栏的「EN / 中」按钮即可实时切换。
- **深色 / 浅色主题**：右上角一键切换，偏好记忆在 `localStorage`。
- **响应式布局**：适配桌面与移动端，移动端导航折叠为汉堡菜单。
- **项目详情页**：每个项目都有独立的详情页（背景 / 内容 / 成果 / 贡献 + 侧边栏）。
- **个人知识库**：独立的 `/notes/` 子站，6 个分类、实时搜索、标签过滤；笔记直接写 Markdown，自动支持代码高亮 / 数学公式 / 目录 / 上下篇 / 相关推荐 / 阅读进度 / 图片放大。
- **滚动渐入动画 + 导航高亮（scrollspy）**。

### 二、目录结构

```raw
5personal_page/
├── index.html              # 主站首页骨架（容器由 JS 填充）
├── package.json            # 构建脚本入口（npm run build:notes）
├── README.md               # 本文件
├── css/
│   ├── style.css           # 主站设计系统
│   └── notes.css           # 知识库专属样式（typography / 代码块 / TOC）
├── js/
│   ├── render.js           # 主站渲染器：加载 data/*.json 并渲染各板块
│   ├── render-project.js   # 项目详情页渲染器（按 ?id= 渲染）
│   ├── render-notes-list.js # 知识库首页渲染器（搜索 / 分类 / 列表 / 标签云）
│   ├── render-note.js      # 单篇笔记渲染器（marked + hljs + KaTeX + TOC）
│   └── main.js             # 主题切换 / 语言切换 / 菜单 / scrollspy / 动画
├── data/                   # ★ 所有结构化内容都在这里 ★ 文件名前缀=主页板块顺序
│   ├── 00_site.json        # 站点标题、Logo、导航、页脚、默认语言/主题
│   ├── 01_hero.json        # 首屏（姓名、头衔、简介、按钮、Key Verticals）
│   ├── 02_about.json       # 01 关于我（段落 + 信息卡 + 头像）
│   ├── 03_education.json   # 02 教育经历（时间线）
│   ├── 04_experience.json  # 03 实习经历（时间线，支持要点 bullets）
│   ├── 05_projects.json    # 04 项目经历（卡片 + 详情页）
│   ├── 06_activities.json  # 05 学生工作（时间线 + 底部 banner）
│   ├── 07_skills.json      # 06 技能（分类标签）
│   ├── 08_publications.json # 07 荣誉与奖项（奖学金 + 竞赛/荣誉）
│   ├── 09_life.json        # 08 日常生活（bio + 信息表 + 兴趣 + 2×2 照片）
│   ├── 10_contact.json     # 09 联系方式
│   ├── 50_notes-meta.json  # 知识库分类元信息（手写）
│   ├── 51_notes-index.json # 知识库笔记索引（由 build-notes.js 生成）
│   ├── 52_notes-gate.json  # 知识库密码门配置（由 set-notes-password 生成）
│   └── 99_status.json      # 备用状态数据（当前未引用）
├── projects/
│   └── project.html        # 项目详情页骨架
├── notes/                  # ★ 知识库子站 ★
│   ├── index.html          # 知识库首页（搜索 / 分类卡 / 列表 / 标签云）
│   ├── note.html           # 单篇笔记渲染页（?id=<category>/<slug>）
│   └── content/            # 你的 Markdown 笔记源文件
│       ├── motor-control/  #   电机控制
│       ├── domain-control/ #   域控制开发
│       ├── deep-learning/  #   深度学习
│       ├── automotive-security/  # 车辆安全
│       ├── tools/          #   工具技巧
│       └── papers/         #   文献资料
├── tools/
│   └── build-notes.js      # 扫描 notes/content/**/*.md → 生成 notes-index.json
├── images/
│   ├── placeholder.svg     # 通用图片占位符（暗色工程风）
│   └── placeholder-photo.svg  # 照片占位符（适合 hero / life 板块）
└── .claude/
    └── launch.json         # 本地预览服务器配置（端口 8131）
```

主站板块顺序（标题带 01–09 编号）：
**关于 → 教育 → 实习 → 项目 → 学生工作 → 技能 → 荣誉 → 生活 → 联系**

导航栏多一个 **「知识库」** 入口，跳到 `/notes/`。

### 三、本地运行

本站通过浏览器 `fetch` 读取本地 JSON，**必须在 HTTP 服务器下运行**（直接双击 `index.html` 会因跨域限制而无法加载数据）。

```bash
# 方式 A：使用 http-server（推荐）
cd 5personal_page
npx -y http-server -p 8131 -c-1

# 方式 B：如已安装 serve
npx -y serve -l 8131

python
python -m http.server 8131
```

然后浏览器访问：`http://localhost:8131/`

> 也可使用 VS Code 的 **Live Server** 插件，右键 `index.html` → “Open with Live Server”。

### 四、如何修改内容

> 双语写法：任何文案都可写成 `"纯字符串"` 或 `{ "zh": "中文", "en": "English" }`。
> 若只写一种语言，切换到另一种时会自动回退显示已有的那一种。

- **改姓名 / 头衔 / 简介**：编辑 `data/01_hero.json`。
- **改关于我 / 信息卡**：编辑 `data/02_about.json`（`avatar` 字段填头像图片路径）。
- **改教育 / 实习 / 学生工作**：分别编辑 `education.json` / `experience.json` / `activities.json`。
  - 时间线条目支持两种正文：`description`（一段话）或 `bullets`（要点数组）。
- **改技能**：编辑 `skills.json`（按分类增删标签）。
- **改荣誉奖项**：编辑 `publications.json`（左栏 `publications` 为奖学金，右栏 `awards` 为竞赛/荣誉）。
- **改联系方式**：编辑 `contact.json`。
- **改站点标题 / 导航 / 页脚 / 默认语言主题**：编辑 `site.json`
  （`defaultLang` 可选 `"zh"`/`"en"`，`defaultTheme` 可选 `"light"`/`"dark"`）。

#### 新增一个项目

在 `data/05_projects.json` 的 `items` 数组中追加一项：

```jsonc
{
  "id": "my-new-project",            // 唯一 ID，用于详情页 URL
  "title": { "zh": "项目名", "en": "Project Name" },
  "summary": { "zh": "一句话简介", "en": "One-line summary" },
  "icon": "cpu",                     // 见下方可用图标
  "cover": "",                       // 卡片封面图（留空则只显示图标）
  "tech": ["Simulink", "AUTOSAR"],   // 技术标签
  "detail": {
    "subtitle": { "zh": "...", "en": "..." },
    "sections": [
      { "heading": {"zh":"项目背景","en":"Background"}, "type": "paragraph",
        "content": {"zh":"...","en":"..."} },
      { "heading": {"zh":"研究内容","en":"Scope"}, "type": "list",
        "items": [ {"zh":"要点1","en":"Point 1"} ] }
    ],
    "images": [
      { "src": "images/xxx.png", "caption": {"zh":"图说","en":"Caption"} }
    ],
    "sidebar": {
      "tech": ["..."],
      "period": { "zh": "2025.09 — 至今", "en": "2025.09 — Present" },
      "results": { "zh": "成果（支持 <br> 换行）", "en": "Outcome" },
      "keywords": [ {"zh":"关键词","en":"Keyword"} ]
    }
  }
}
```

**可用图标 `icon`**：`monitor`、`clock`、`team`、`book`、`award`、`user`、`cpu`、`shield`、`radio`、`wrench`。

### 五、知识库（`/notes/`）

知识库是独立的子站，专门用来挂载 Markdown 笔记。访问 `http://localhost:8131/notes/` 即可进入，主站导航栏右侧的「**知识库**」也是同一个入口。

#### 5.1 页面结构

- **`/notes/index.html`** —— 知识库首页
  - 顶部 hero + 实时搜索框（按 `/` 聚焦）
  - **[01] 分类**：6 张分类卡片，显示各分类笔记数
  - **[02] 最近更新 / 搜索结果**：笔记列表，按更新时间倒序
  - **[03] 热门标签**：标签云，点击可筛选
- **`/notes/note.html?id=<category>/<slug>`** —— 单篇笔记
  - 左侧正文（最佳阅读宽度 720px）+ 右侧 sticky **自动目录**
  - 顶部面包屑：知识库 / 分类 / 标题
  - 元信息：发布日期、更新日期、阅读时长、字数
  - 顶部细 **阅读进度条**，代码块右上角 **复制** 按钮
  - 点击任意图片 **放大 lightbox**
  - 文末：**上一篇 / 下一篇** 卡片 + **相关阅读**（同分类 + 共享标签）

#### 5.2 写一篇新笔记的完整流程

**Step 1.** 在 `notes/content/<分类>/` 下新建一个 `.md` 文件。文件名变成 URL 里的 slug，**用英文小写、连字符**：

```raw
notes/content/motor-control/my-new-note.md
                                ↑↑↑↑↑↑↑↑↑↑
                                URL: ?id=motor-control/my-new-note
```

**Step 2.** 顶部加 **YAML frontmatter**（这是索引脚本的依据）：

```markdown
---
title: 你的笔记标题
date: 2026-05-31
updated: 2026-05-31
category: motor-control     # 必须与目录一致
tags: [foc, tip, debug]     # 标签数组
summary: 一句话摘要，会显示在首页列表上。
draft: false                # true 时不进索引（写作中可用）
---

## 第一节
正文……
```

**Step 3.** 正文 Markdown 支持的完整语法：
| 语法 | 渲染效果 |
|---|---|
| `# / ## / ###` | 标题（h2/h3 自动进 TOC，自动生成锚点 id） |
| `**bold**` `_italic_` | 加粗 / 斜体 |
| `` `code` `` | 行内代码（高亮色） |
| ` ```lang ` 代码块 | 自动 highlight.js 语法高亮（支持 matlab/python/c/js/json 等） |
| `[文字](url)` | 链接（站内可写相对路径，如 `?id=other-note`） |
| `![alt](path)` | 图片（自动加圆角边框，点击放大 lightbox） |
| 表格 (`\| a \| b \|`) | 自动 GFM 表格样式（隔行底色） |
| `> 引用` | 引用块（左侧橙色竖条） |
| `$...$` / `$$...$$` | KaTeX 数学公式（行内 / 块） |
| `---` | 分隔线 |
| `- [ ]` | 任务列表 |

**Step 4.** 运行构建脚本，更新索引：

```bash
npm run build:notes
# 或：node tools/build-notes.js
```

脚本会扫描所有 `.md` 的 frontmatter，输出 `data/51_notes-index.json`（按 `updated` 倒序）。控制台会列出收录的笔记一览。

**Step 5.** 刷新浏览器即可看到新笔记。如果部署到 GitHub Pages，`git push` 之前别忘了先跑一次 `npm run build:notes`，再 `git add data/51_notes-index.json`。

#### 5.3 分类管理

6 个分类的名字、图标、描述都在 `data/50_notes-meta.json` 里维护：

```jsonc
{
  "categories": [
    {
      "id": "motor-control",          // 必须与 notes/content/<id>/ 目录名一致
      "name": { "zh": "电机控制", "en": "Motor Control" },
      "icon": "cpu",                  // 可选: cpu / monitor / brain / shield / wrench / book
      "color": "#ff6a00",             // 预留色（当前只用 accent 全局色）
      "description": { "zh": "…", "en": "…" }
    }
  ]
}
```

**新增一个分类**：

1. 在 `notes/content/` 下建一个新目录（如 `notes/content/my-topic/`）
2. 在 `data/50_notes-meta.json` 的 `categories` 数组里追加一项（`id` 与目录名一致）
3. 在该目录下写 .md，跑 `npm run build:notes`

#### 5.4 写作工作流（推荐）

参考已写好的示例笔记 [`notes/content/tools/vscode-tips.md`](notes/content/tools/vscode-tips.md)：

- **VS Code** 打开仓库根目录
- 安装 **Markdown All in One** + **Markdown Preview Enhanced** + **Paste Image**
- 写作时 `Ctrl+Shift+V` 开侧栏预览
- 截图直接 `Ctrl+Alt+V` 贴成图（自动写到 `img/` 子目录）
- 写完 → `npm run build:notes` → `git push`

#### 5.5 部署到 GitHub Pages

知识库与主站共用同一个仓库，部署完全一样：

```bash
# 一次性：在 GitHub 仓库 Settings → Pages → Source 选 main 分支
echo > .nojekyll                    # 避免 Jekyll 误处理
git add .nojekyll
```

日常推送：

```bash
npm run build:notes                 # 1. 更新索引
git add notes/ data/51_notes-index.json
git commit -m "notes: add xxx note"
git push
```

> ⚠️ 当前**知识库与主站都是公开**的（GitHub Pages 公开仓库）。所有 `.md` 内容都会被任何人访问，写之前请确认无敏感信息。

### 六、可扩展 / 待补充的地方（含图片位）

| 位置 | 文件 / 字段 | 说明 |
| --- | --- | --- |
| 个人头像 | `data/02_about.json` → `avatar` | 当前为空（显示占位图标）。放一张照片到 `images/`，把路径填进去即可。 |
| 项目封面 | `data/05_projects.json` → 各项 `cover` | 留空仅显示图标；填图片路径后卡片顶部显示封面。 |
| 项目详情配图 | `data/05_projects.json` → `detail.images` | 「混合动力域控制」已放 1 张占位图示例，可替换为 Simulink 模型图 / 上位机截图 / 赛车照片等。 |
| 简历下载 | `data/10_contact.json` → `cta.buttonHref` | 当前为 `"#"`。把简历 PDF 放进文件夹并填入路径，下载按钮即生效。 |
| 通用占位图 | `images/placeholder.svg` | 任何图片栏都可临时引用它。 |
| 量化指标 | `data/05_projects.json` 各详情 | 简历未给出的数据处标注了「可在此补充」，有实测数值时可补全。 |

> 需要图片时：可自行寻找/生成合适的图片，或先用 `images/placeholder.svg` 占位。

### 七、维护手册（手把手详细指南）

> 这一章是给**日常维护**写的：每一步都告诉你打开哪个文件、改哪一行、效果在哪里看。完全不需要懂前端代码。

#### 7.1 先掌握两个基本概念

**① 双语字段写法**

文件里很多字段长这样：
```json
"title": { "zh": "中文标题", "en": "English Title" }
```
- 切换 EN / 中 按钮时，对应字段自动跟着换
- 也可以只写一种语言：`"title": "纯字符串"`，两种语言都显示这个
- 只写了 `{ "zh": "..." }`（漏掉 en）时，切到英文会回退显示中文

**② 改完怎么生效**

1. 文件保存（`Ctrl+S`）
2. 浏览器 **硬刷新**（`Ctrl+Shift+R` 或 `Ctrl+F5`）
3. 不需要重启服务器
4. **改了 `.md` 笔记后**，先在终端跑 `npm run build:notes` 更新索引，再刷新

#### 7.2 数据文件 → 页面位置 对应表

| JSON 文件 | 控制页面哪里 | 改这里能做什么 |
| --- | --- | --- |
| `data/00_site.json` | 顶部导航栏 + 页脚 + Logo + 浏览器标题 | 改菜单项、Logo、网站名、页脚标语 |
| `data/01_hero.json` | 首屏（最顶部那一屏） | 改名字、头衔、首屏右侧大图、核心方向 |
| `data/02_about.json` | **01 关于我** | 改自我介绍、信息卡、**头像** |
| `data/03_education.json` | **02 教育经历** | 加/删学校条目 |
| `data/04_experience.json` | **03 实习经历** | 加/删实习条目 |
| `data/05_projects.json` | **04 项目** + 详情页 | 加/删项目、改封面、改详情图 |
| `data/06_activities.json` | **05 学生工作** + 底部 banner | 加/删活动、改底部 banner 图 |
| `data/07_skills.json` | **06 技能** | 加/删技能分类与标签 |
| `data/08_publications.json` | **07 荣誉与奖项** | 加/删奖学金、竞赛荣誉 |
| `data/09_life.json` | **08 日常生活** | 改 bio、信息表、兴趣、**4 张生活照** |
| `data/10_contact.json` | **09 联系方式** | 改邮箱、电话、简历下载 |
| `data/50_notes-meta.json` | 知识库（分类元信息） | 改分类名、增加分类 |
| `data/51_notes-index.json` | 知识库（笔记索引） | **不要手改**，由 `npm run build:notes` 自动生成 |

#### 7.3 每个板块怎么改（逐个详解）

##### 7.3.1 Hero（首屏）

文件：`data/01_hero.json`
```jsonc
{
  "name":        { "zh": "袁修玮", "en": "Yuan Xiuwei" },     // 大名字
  "title":       { "zh": "...", "en": "..." },                // 副标题
  "description": { "zh": "...", "en": "..." },                // 简介段
  "images": [                                                  // ★ 右侧主图（≥ 2 张自动轮播，见 7.4）
    "images/home_page/hero-1.jpg",
    "images/home_page/hero-2.jpg",
    "images/home_page/hero-3.jpg"
  ],
  "carousel": {                                                // 轮播节奏配置（可省略，用默认值）
    "interval":     5000,                                      // 切换间隔，毫秒（默认 5000 = 5 秒）
    "pauseOnHover": true                                       // 鼠标悬停时是否暂停（默认 true）
  },
  "verticals": {
    "label": { "zh": "核心方向", "en": "Key Verticals" },
    "items": [                                                // ★ 4 个核心方向（建议 3~4 项）
      { "zh": "电机控制算法（FOC / LADRC）", "en": "..." },
      { "zh": "域控制策略（MBD / AUTOSAR）", "en": "..." }
      // ... 复制行再加
    ]
  }
}
```

> 旧字段 `image` (单图) 仍兼容；用 `images` 数组更推荐 —— 数组只有 1 张就静态显示，≥ 2 张自动启用轮播控件（左右箭头 + 底部圆点 + 自动播放）。

##### 7.3.2 About（01 关于我）

文件：`data/02_about.json`

- **改自我介绍段**：编辑 `paragraphs` 数组，可加任意多段
  "paragraphs": [
    { "zh": "第一段...", "en": "..." },
    { "zh": "第二段...", "en": "..." }
  ]
- **改信息卡**：编辑 `info` 数组（建议 2 或 4 项，会自适应栅格）
  "info": [
    { "label": {"zh":"学校","en":"University"}, "value": {"zh":"...","en":"..."} }
  ]
- **加头像照片**（手把手 3 步）：
  1. 把头像图（正方形，至少 400×400，jpg/png）放到 `images/avatar.jpg`
  2. 把 `"avatar": ""` 改成 `"avatar": "images/avatar.jpg"`
  3. 保存 → 浏览器硬刷新

##### 7.3.3 Education / Experience / Activities（时间线类）

这三个文件结构相同，操作一样。

通用结构：
```jsonc
"items": [
  {
    "school": { "zh": "学校名/公司名/机构名", "en": "..." },
    "period": "2024.09 — 至今",                       // 也可以是 { "zh":"...","en":"..." }
    "degree": { "zh": "学位/岗位/职务", "en": "..." },
    "description": { "zh": "一段描述", "en": "..." }, // ↓ 二选一
    "bullets": [                                       // ↓ 多个要点用这个
      { "zh": "要点 1", "en": "..." },
      { "zh": "要点 2", "en": "..." }
    ],
    "tags": [
      { "zh": "标签", "en": "Tag" },
      "Python"                                        // 单语言也可
    ]
  }
]
```

> `description`（一段话）和 `bullets`（要点数组）**二选一**。

- **加一条**：把现有任意一项 `{ ... }` 复制一遍，改字段
- **删一条**：删除对应对象（注意保留 JSON 逗号合法）
- **Activities 底部 banner 图**：
  "banner": {
    "image":   "images/activities-banner.jpg",   // ★ banner 大图路径
    "eyebrow": { "zh": "学生活动 · 校园生活", "en": "..." },
    "title":   { "zh": "大标题", "en": "..." }
  }
  不想要 banner：把 `"image"` 留空字符串即可

##### 7.3.4 Projects（04 项目）

文件：`data/05_projects.json` —— 每个项目 = `items` 数组里一个对象。

**新加一个项目（完整模板）**：
```jsonc
{
  "id":      "my-new-project",                  // 唯一英文 id，决定详情页 URL
  "title":   { "zh": "项目名", "en": "..." },
  "summary": { "zh": "一句话简介", "en": "..." },
  "icon":    "cpu",                             // 卡片左上角图标，可选见下
  "cover":   "images/proj-my-new.jpg",          // ★ 卡片封面图
  "tech":    ["Simulink", "AUTOSAR"],           // 卡片底部技术标签
  "detail": {
    "subtitle": { "zh": "...", "en": "..." },   // 详情页副标题
    "sections": [
      { "heading": {"zh":"项目背景","en":"Background"},
        "type": "paragraph",
        "content": {"zh":"...","en":"..."} },
      { "heading": {"zh":"研究内容","en":"Scope"},
        "type": "list",
        "items": [
          {"zh":"要点 1","en":"..."},
          {"zh":"要点 2","en":"..."}
        ] }
    ],
    "images": [                                  // ★ 详情页配图（0~多张，2 列网格）
      { "src": "images/proj-my-new-1.jpg",
        "caption": {"zh":"图 1：xxx","en":"Fig 1: ..."} }
    ],
    "sidebar": {
      "tech":    ["..."],
      "period":  "2025.09 — 至今",
      "results": {"zh":"成果（支持 <br> 换行）","en":"..."},
      "keywords":[{"zh":"关键词","en":"..."}]
    }
  }
}
```

**可用 `icon` 值**：`monitor / clock / team / book / award / user / cpu / shield / radio / wrench`

- **换某个项目的封面**：找到对应项目的 `"cover"`，改成新图路径
- **某个项目详情页加配图**：在 `detail.images` 数组里追加 `{ "src": "...", "caption": {...} }`

##### 7.3.5 Skills（06 技能）

文件：`data/07_skills.json`
```jsonc
"categories": [
  {
    "name": { "zh": "编程语言", "en": "Programming" },
    "skills": [
      { "zh": "Python（深度学习）", "en": "Python (DL)" },
      "C/C++"                              // 单语言也行
    ]
  }
  // 加新类别就在数组里再追加一个 {}
]
```

##### 7.3.6 Publications（07 荣誉与奖项）

文件：`data/08_publications.json` —— 两栏：左奖学金、右竞赛/荣誉。
```jsonc
"publications": [                                // ← 左栏 奖学金
  {
    "type": "scholarship",
    "title": { "zh": "...", "en": "..." },
    "meta":  { "zh": "颁发机构 · 等级", "en": "..." }
  }
],
"awards": [                                      // ← 右栏 竞赛/荣誉
  {
    "year":  { "zh": "竞赛", "en": "Contest" },  // 左侧小徽章文字
    "title": { "zh": "奖项名 · 等级", "en": "..." },
    "meta":  { "zh": "主办方", "en": "..." }
  }
]
```

##### 7.3.7 Life（08 日常生活）

文件：`data/09_life.json`

- **改 bio 段**：编辑 `intro.title` + `intro.paragraph`
- **改信息表**：编辑 `info`（4 行 key-value）
- **改兴趣按钮**：编辑 `hobbies`，可用 `icon`：`bike / run / ball / paddle / shuttlecock / mountain / camera / book / music / coffee`
- **替换底部 banner**：编辑顶层 `banner` 对象 (`image` / `eyebrow` / `title`)；想去掉 banner，把整个 `banner` 对象删掉即可
- **替换 4 张生活照**（每张可以是多图轮播）：
  "carousel": {                                         // 4 个图位共用的轮播节奏
    "interval":     5000,                               // 切换间隔（毫秒，默认 5000）
    "pauseOnHover": true                                // hover 暂停（默认 true）
  },
  "photos": [
    {
      "icon":  "mountain",                              // 左下角小图标
      "title":       { "zh": "户外徒步", "en": "Hiking" },
      "description": { "zh": "图下说明", "en": "..." },
      "images": [                                       // ★ 数组 — 想几张就几张
        "images/daily_life/travel-1.jpg",
        "images/daily_life/travel-2.jpg",
        "images/daily_life/travel-3.jpg"
      ]
    }
    // 共 4 个图位（icon / 标题 / 描述 各自独立），数组里每张都自动轮播
  ]
  > 旧字段 `src` (单图) 仍兼容；用 `images` 数组更推荐。数组只有 1 张就静态显示，≥ 2 张自动启用轮播控件。照片建议横向 4:3（约 1200×900），单张压到 300KB 内。

##### 7.3.8 Contact（09 联系方式）

文件：`data/10_contact.json`
```jsonc
"links": [
  { "type": "email", "label": "your@mail.com", "href": "mailto:your@mail.com" },
  { "type": "phone", "label": "13xxxxxxxxx",   "href": "tel:13xxxxxxxxx" }
]
```

**让"下载简历"按钮真正工作**：
1. 把简历 PDF 放到项目根目录（与 `index.html` 同级），例如 `Resume.pdf`
2. 编辑 `data/10_contact.json`：`"buttonHref": "Resume.pdf"`
3. 保存刷新 → 点击按钮即可下载

##### 7.3.9 Site（顶部导航 / 页脚 / 站点信息）

文件：`data/00_site.json`

- **改 Logo（左上角字母）**：`"logo": "YXW"`
- **改导航**：
  "nav": [
    { "label": {"zh":"关于","en":"About"}, "href": "#about" },
    // href 写 "#xxx" 跳主页 section，"notes/" 跳知识库
  ]
- **改页脚标语 / 版权**：
  "footer": {
    "tagline":   { "zh": "...", "en": "..." },
    "copyright": { "zh": "...", "en": "..." }
  }
```raw

#### 7.4 图片管理（重点）

> **支持哪些格式？** 任何浏览器原生支持的图片格式 —— `.jpg` / `.jpeg` / `.png` / `.webp` / `.avif` / `.gif` / `.svg` 全部都可以。系统用的是标准 `<img src="...">` 标签，对格式没有限制。`.svg` 占位图只是因为体积小、内置好看的占位画面，你完全可以替换成 jpg / png / webp。

> **图片是怎么"放进框"的？** 当前所有图位都用 `object-fit: contain` —— **等比缩放、完整显示**，不会被裁掉任何一块。如果照片的宽高比和容器不一致，容器边会留一点带渐变的"呼吸空间"。
>
> 这意味着：
> - ✅ 不管你的照片是横拍 / 竖拍 / 正方形，**整张图都看得见**
> - ⚠️ 横图放进竖框（或反之）会有"留白"边条 —— 这是正常设计的一部分，不是 bug
> - 想让某个位置的图**满铺裁剪**（更视觉冲击但会裁边）→ 在 `css/style.css` 里找到对应 `object-fit: contain` 改成 `cover` 即可：
>   - 头像 → `.avatar-frame img`
>   - Hero 主图 → `.hero-image img`
>   - 项目封面 → `.project-cover img`
>   - 生活照 → `.life-photo img`
>   - 学生工作 banner → `.timeline-banner img`
>
> **要照片不留白？** 提前把照片裁剪成对应容器的比例再上传：

| 位置 | 容器宽高比 | 建议照片比例 |
|---|---|---|
| Hero 主图 | 4 : 3.4 | 约 1200×1020 |
| About 头像 | 1 : 1 | 正方形 |
| 项目封面 | 16 : 10 | 1200×750 |
| 生活照 | 4 : 3 | 1200×900 |
| 学生工作 banner | 16 : 5 | 1600×500 |

##### 7.4.1 图片放在哪儿

**统一放在 `images/` 目录下**，命名随意但建议有意义。
```
images/
├── placeholder.svg          ← 自带（暗色工程风占位图）
├── placeholder-photo.svg    ← 自带（照片风占位图）
├── avatar.jpg               ← 你加：头像
├── hero.jpg                 ← 你加：首屏右侧主图
├── proj-1-cover.jpg         ← 你加：项目 1 封面
├── proj-1-fig-1.jpg         ← 你加：项目 1 详情页配图
├── activities-banner.jpg    ← 你加：学生工作底部 banner
├── life-hiking.jpg          ← 你加：日常生活照片之一
└── ...

##### 7.4.2 图片格式与尺寸建议

| 用途 | 推荐尺寸 | 比例 | 格式 | 大小 |
| --- | --- | --- | --- | --- |
| Hero 主图 | 约 1200×1020 | ~4:3.4 | jpg/png | < 500 KB |
| About 头像 | 400×400 起 | 1:1 正方形 | jpg | < 200 KB |
| 项目封面 | 1200×750 | 16:10 | jpg | < 400 KB |
| 项目详情图 | 1200×800 | 3:2 灵活 | jpg/png | < 500 KB |
| 学生工作 banner | 1600×500 | 16:5 宽幅 | jpg | < 600 KB |
| 日常生活照 | 1200×900 | 4:3 横向 | jpg | < 300 KB |

> 推荐工具：[TinyPNG](https://tinypng.com/) 压缩 jpg/png ・ [Squoosh](https://squoosh.app/) 调尺寸+压缩

##### 7.4.3 手把手 4 步：把一张图插入网页

**示例**：把首屏右侧大图换成自己拍的引擎照片。

**Step 1 准备图片**

裁到约 1200×1020，存成 `engine.jpg`，压到 400 KB 内。

**Step 2 放进项目**

把 `engine.jpg` 拖到 `F:\6Project_App\5personal_page\images\` 目录下。

**Step 3 改 JSON 路径**

打开 `data/01_hero.json`，把：
```json
"image": "images/placeholder-photo.svg",
```
改成：
```json
"image": "images/engine.jpg",
```
保存。

**Step 4 看效果**

浏览器打开 `http://localhost:8131/`，按 **Ctrl+Shift+R 硬刷新**，新图出现在首屏右侧。

##### 7.4.4 所有图片插入位置速查表

| 想换哪里的图 | 编辑哪个 JSON | 改哪个字段 | 是否支持轮播 |
| --- | --- | --- | --- |
| 首屏右侧主图 | `data/01_hero.json` | `"images"` 数组（兼容旧 `"image"`） | **✅ 多图自动轮播** |
| 关于我 - 头像 | `data/02_about.json` | `"avatar"` | 单图 |
| 第 N 个项目卡片封面 | `data/05_projects.json` | 第 N 个项目的 `"cover"` | 单图 |
| 第 N 个项目详情页配图 | `data/05_projects.json` | 第 N 个项目的 `"detail.images"` 数组 | 多图独立排列（不轮播） |
| 日常生活第 N 个图位 | `data/09_life.json` | `"photos[N-1].images"` 数组（兼容旧 `"src"`） | **✅ 多图自动轮播** |
| 日常生活底部 banner | `data/09_life.json` | `"banner.image"` | 单图 |
| 学生工作底部 banner | （已移除，可参考 `data/06_activities.json` 加回 `"banner"` 对象） | — | — |
| 简历 PDF（不是图，同理） | `data/10_contact.json` | `"cta.buttonHref"` | — |
| 笔记正文里插图 | 直接在 `.md` 里写 `![说明](./img/xxx.jpg)` | 图片放 `.md` 同级 `img/` 目录 | — |

##### 7.4.5 暂时没图怎么办

- **临时占位**：路径填 `"images/placeholder.svg"`（暗色工程风）或 `"images/placeholder-photo.svg"`（照片风）
- **整段不要图**：把字段值设为 `""` 空字符串，对应位置会留空或显示替代图标
- **找免费图**：[Unsplash](https://unsplash.com/) / [Pexels](https://www.pexels.com/) 免版权高清图

##### 7.4.6 图片轮播 / 切换节奏

支持轮播的位置（首屏 hero + 日常生活 4 个图位）都用 `images` 数组 + `carousel` 配置控制。

**改"几秒切一张"** —— 编辑对应文件的 `carousel.interval`（**毫秒**）：

```jsonc
// data/01_hero.json — Hero 首屏轮播节奏
"carousel": {
  "interval":     5000,   // ← 5000 毫秒 = 5 秒一张；想快一点改 3000，慢一点改 8000
  "pauseOnHover": true    // ← 鼠标悬停在图上时是否暂停（默认 true 暂停，改 false 持续播放）
}
```
```jsonc
// data/09_life.json — 4 个生活图位共用一组节奏
"carousel": {
  "interval":     5000,
  "pauseOnHover": true
}
```

> Hero 和 Life 的 `carousel` 配置是**各自独立**的。想让 hero 走 4 秒、life 走 6 秒？分别填即可。

**轮播控件交互行为**（已内建，无需配置）：

- **自动播放**：每 `interval` 毫秒自动切到下一张，最后一张会循环回第一张
- **左右箭头**：鼠标悬停在图上时浮现（半透明黑底），点击切换 + 重置定时器
- **底部圆点**：每张图一个点，当前是橙色短条，点击直接跳到对应图
- **hover 暂停**（如启用）：鼠标离开后继续自动播放
- **平滑过渡**：默认 0.6 秒 opacity crossfade（不是硬切）

**调整图片数量**：直接增删 `images` 数组里的元素即可。

```jsonc
"images": [
  "images/home_page/hero-1.jpg",  // ← 想加更多就在这里加新行
  "images/home_page/hero-2.jpg",
  "images/home_page/hero-3.jpg"
  // 1 张 → 静态显示，无轮播控件
  // 2 张以上 → 自动启用轮播
]
```

**关闭某个位置的轮播**：把 `images` 数组只留 1 张，或者改回单字段 `"image": "..."` / `"src": "..."`（旧字段仍兼容）。

**整体禁用 hover 暂停**：把 `pauseOnHover` 设 `false`，无论鼠标在不在图上都持续播放（路演展示场景适用）。

**关于图片填充**：所有轮播图都用 `object-fit: contain`（等比缩放、完整显示），留白处自动用同图的**模糊版本铺底**（沉浸式 blur backdrop，类似 Apple Music 风格）—— 不会出现死板的灰边。若想换回"满铺裁剪"行为（更视觉冲击但会裁边），见 §7.4 顶部说明的 CSS 调整方法。

#### 7.5 添加一篇知识库笔记（5 步精简版）

> 完整版见第五章。这里给最短可执行步骤。

1. **选分类目录**：`notes/content/<category>/`（6 个现成分类，需新分类见 5.3）
2. **新建 .md**：文件名英文小写连字符，如 `notes/content/tools/git-tips.md`，URL 自动是 `?id=tools/git-tips`
3. **写 frontmatter + 正文**：
   ---
   title: 你的标题
   date: 2026-05-31
   updated: 2026-05-31
   category: tools
   tags: [git, cli]
   summary: 一句话摘要。
   ---

   ## 第一节
   正文……
```raw
4. **重建索引**：终端进入项目根，跑 `npm run build:notes`
5. **看效果**：浏览器 `http://localhost:8131/notes/` 硬刷新

#### 7.6 改完别忘了的检查清单

- [ ] 文件保存了吗（`Ctrl+S`）
- [ ] 浏览器硬刷新（`Ctrl+Shift+R`）
- [ ] JSON 格式没错（逗号、引号、括号都配对），可在 [jsonlint.com](https://jsonlint.com) 验证
- [ ] 中英文都切一次看看，避免 EN 漏写导致回退到中文
- [ ] 拉窄浏览器看移动端排版（F12 → 切设备模式）
- [ ] 暗/亮主题各切一次
- [ ] 改了 `.md` 之后跑了 `npm run build:notes`
- [ ] 推到 GitHub 前 `git add data/51_notes-index.json` 一起提交

### 八、知识库密码门

#### 8.1 它是什么、能挡住什么

知识库子站 `/notes/` 加了一道**密码门**：访客没输对密码就看不到笔记列表与单篇内容。

⚠️ **重要前提（请先读）**：这是**客户端密码门**，不是真加密。
- ✅ **能挡住普通访客**随便点进去 —— 对绝大多数路过的人足够
- ⚠️ **懂 F12 / 查源码的人可以绕过** —— 直接 `notes/content/<分类>/<slug>.md` 仍然可访问
- 真正机密的内容**请不要写**进知识库。需要真加密 → 见 §8.6

#### 8.2 默认密码

初始密码为：

```
welcome2026

第一次跑起来后，**强烈建议立即改成自己的密码**（见 §8.3）。

#### 8.3 修改密码（一行命令）

终端进入项目根目录：

```bash
npm run set:password -- mynewstrongpass
# 或：
node tools/set-notes-password.js mynewstrongpass
```

会发生什么：
- 用 `SHA-256(salt + 你的密码)` 算出哈希
- 把哈希写入 `data/52_notes-gate.json` 的 `passwordHash` 字段
- **明文密码不会被保存到任何文件**（你自己记好）
- 之前已解锁的浏览器 **不会立刻失效** —— localStorage 里的解锁记录还在；要让它立刻重新弹门：清浏览器 localStorage 或换无痕窗口

**密码要求**：≥ 6 位。强烈建议 ≥ 12 位，含字母+数字。

#### 8.4 工作原理（一图说清）

```raw
访问 /notes/  或  /notes/note.html?id=…
        │
        ▼
  HTML <head> 顶部 sentinel 同步检查 localStorage
        │
        ├── 已解锁 ───────────────────► 正常渲染笔记
        │   (7 天内有效，过期重新输入)
        │
        └── 未解锁 ───────────────────► 跳转 /notes/login.html?returnTo=…
                                           │
                                           ▼
                                   输入密码 → 浏览器算 SHA-256
                                           │
                                           ├── 匹配 → 写 localStorage → 跳回原页
                                           └── 不匹配 → 抖动 + 显示错误
```

关键文件：

| 文件 | 作用 |
| --- | --- |
| `data/52_notes-gate.json` | 哈希 + 盐 + 记忆天数 + 双语文案 |
| `notes/login.html` | 登录页骨架 |
| `js/notes-gate.js` | 登录页逻辑（SHA-256 + 表单 + 错误提示） |
| `notes/index.html` `<head>` 的 inline `<script>` | 同步检查 + 跳转 sentinel |
| `notes/note.html` `<head>` 的 inline `<script>` | 同样的 sentinel |
| `tools/set-notes-password.js` | 命令行修改密码 |

#### 8.5 常见操作

**改"记住我"的天数**：编辑 `data/52_notes-gate.json` 的 `"rememberDays": 7`，改成你想要的天数。
> 用户登录时勾选了「记住我」就用这个天数；不勾就只在当前浏览器会话期间有效。

**改门面文案**（标题/副标题/提示等）：编辑 `data/52_notes-gate.json` 的 `title` / `subtitle` / `hint` / `errorMsg` / `rememberLabel` / `unlockLabel` / `backLabel` 各字段（都是双语 `{zh, en}` 格式）。

**完全关闭密码门**（让 `/notes/` 公开访问）：把 `data/52_notes-gate.json` 改为：

```json
{ "enabled": false }
```

然后**还要删除两处 sentinel 脚本**才能真正生效（关掉 enabled 后 login 页会自动放行，但 sentinel 的存在还是会先跳 login 页再跳回来 —— 体验差）。删 sentinel：打开 `notes/index.html` 和 `notes/note.html`，删掉文件顶部 `<head>` 里那段 `<!-- Notes access-gate sentinel ... -->` 注释 + 紧跟的 `<script>(function(){ ... })();</script>` 整块。

**忘记自己设的密码**：直接 `npm run set:password -- newpassword` 覆盖即可，不需要原密码。

**强制让某个浏览器重新输入密码**：在浏览器 F12 → Application → Local Storage → 删 `notes-gate-unlocked-v1` 这一项，或者直接换无痕窗口。

#### 8.6 如果要"真"加密怎么办

当前方案的本质限制：源码（HTML / JS / `.md`）都是 GitHub Pages 上的静态文件，**任何人都能直接 fetch**。密码门只在「JS 引导渲染流程」这一层挡。

真正想让没密码的人也读不到内容，可以升级到：

- **[staticrypt](https://github.com/robinmoisson/staticrypt)** —— 用密码 AES-256 加密整个 HTML / .md 文件，密码即解密 key。每次写完笔记要跑一次 `staticrypt encrypt`，比当前方案重，但是真加密。
- **私有部署 + 后端鉴权**（Cloudflare Pages + Functions / Vercel / 自建）—— 服务端校验密码或 OAuth，源文件不暴露。最安全但要服务器。

如果有需要再说，我可以帮你迁移到这两种方案之一。

### 九、部署到 GitHub Pages

GitHub Pages 是免费托管静态网站的服务，最适合本项目（纯静态 + Node 构建步骤）。本节给一个**完全可复制的零基础流程**，分两部分：第一次部署 + 后续更新。

#### 9.1 一次性准备（只做一次）

**你需要**：
1. 一个 GitHub 账号（[github.com](https://github.com)）
2. 本机已装 [Git](https://git-scm.com/download/win)（终端跑 `git --version` 能输出版本号即可）
3. 本机已装 [Node.js](https://nodejs.org)（同样 `node --version` 验证）
4. 给 git 配过身份（一次性）：
   git config --global user.name  "你的名字"
   git config --global user.email "you@example.com"

**两个仓库命名选项**（选一个）：

| 命名方式 | 最终访问 URL | 适用场景 |
| --- | --- | --- |
| **A. `<用户名>.github.io`** | `https://<用户名>.github.io/` | **推荐** — URL 最短、最专业，作为个人主站 |
| **B. 普通仓库名（如 `personal-page`）** | `https://<用户名>.github.io/personal-page/` | 已经有 A 的用户名仓库 ／ 想多个项目并存 |

下面以 **A 方案**（推荐）举例。如果你选 B，把所有 `<用户名>.github.io` 替换为你的实际仓库名即可，代码逻辑都兼容。

#### 9.2 第一次部署（共 6 步）

##### Step 1 · 在 GitHub 创建仓库

1. 登录 [github.com](https://github.com)，右上角 **+ → New repository**
2. **Repository name** 填：`<你的用户名>.github.io`（用 A 方案；否则填项目名）
3. **Public**（必须公开，Pages 免费版要求；如果你有 GitHub Pro，私有也行）
4. **不要**勾选"Add a README"、"Add .gitignore"、"Choose a license"（避免与本地冲突，我们要 push 本地版本）
5. 点 **Create repository**

页面会跳到一个空仓库，给出几条命令 —— 先**不要照搬**，按下面我们的步骤走。

##### Step 2 · 本地初始化 git

打开终端（git-bash / PowerShell），进到项目根目录：

```bash
cd "F:/6Project_App/5personal_page"

# 初始化 git，默认分支名设为 main（GitHub 默认 main）
git init -b main

# 验证状态
git status
```

> 如果 `git init -b main` 报错（老版本 git），改用：
> git init && git branch -M main

##### Step 3 · 部署前最后一次构建

```bash
# 重建笔记索引（如果你改过 notes/content 下的 .md）
npm run build:notes

# 本地预览一次，确保没问题
npx -y http-server -p 8131 -c-1
# 浏览器访问 http://localhost:8131/ — 全部刷一遍：主页、子板块、知识库登录、单篇笔记
# 关掉这个服务器（Ctrl+C）
```

##### Step 4 · 首次提交

```bash
# 把所有文件加入暂存（.gitignore 自动忽略 node_modules / 备份目录等）
git add .

# 看一下都加了什么（应该几十个文件）
git status --short | head -30

# 第一次提交
git commit -m "Initial portfolio site — Yuan Xiuwei"
```

##### Step 5 · 关联远程仓库 & 推送

回到刚才那个 GitHub 空仓库页面，复制 **HTTPS** 地址（形如 `https://github.com/<用户名>/<用户名>.github.io.git`）。

```bash
# 关联远程
git remote add origin https://github.com/<用户名>/<用户名>.github.io.git

# 推送到 main 分支
git push -u origin main
```

首次推送会弹出 GitHub 登录窗口（要求 PAT 或浏览器授权）：
- 推荐用 **GitHub CLI** 一次性解决：`gh auth login`
- 或者用 **Personal Access Token**：GitHub Settings → Developer settings → Personal access tokens → 生成一个 `repo` scope 的 token，密码框粘贴即可

推送成功后，GitHub 仓库页刷新就能看到所有文件。

##### Step 6 · 启用 GitHub Pages

1. 仓库页面 → **Settings**（顶部菜单最右）
2. 左侧导航 → **Pages**
3. **Source** 选 **Deploy from a branch**
4. **Branch** 选 `main` / **`/(root)`** → 点 **Save**
5. 等约 30 秒~2 分钟，页面顶部会出现 "**Your site is live at `https://<用户名>.github.io/`**"

打开那个 URL —— 你的网站上线了。

> ⚠️ 第一次部署可能需要 5~10 分钟生效（DNS 缓存）。如果访问 404，等几分钟再刷新。

#### 9.3 后续日常更新（一次记住的工作流）

每次想更新内容（改 JSON、加笔记、换图片）后：

```bash
# 1. 如果改了 notes/content/*.md，重建索引
npm run build:notes

# 2. 本地预览验证（可选但推荐）
npx -y http-server -p 8131 -c-1
#   → 浏览器看一眼，确认没问题，Ctrl+C 关掉

# 3. 提交
git add .
git status --short        # 检查改了哪些
git commit -m "describe what changed, e.g. 'add new motor-control note'"

# 4. 推送
git push
```

推送完约 30 秒 - 1 分钟，GitHub Pages 自动重新部署。刷新浏览器（**Ctrl+Shift+R 硬刷新**清 CDN 缓存）即可看到更新。

#### 9.4 部署前检查清单

每次 `git push` 前过一遍：

- [ ] 文件全部保存（`Ctrl+S`）
- [ ] 改过 `.md` 笔记 → 跑了 `npm run build:notes`
- [ ] `data/51_notes-index.json` 已在 `git status` 中显示为已修改（被 build 脚本更新过）
- [ ] 本地预览 `http://localhost:8131/` 无报错（F12 控制台无红字）
- [ ] 中英文都切一次，移动端宽度看一眼
- [ ] 暗 / 亮主题切一次
- [ ] 没有把简历 / 真实密码 / 隐私照片误加到 commit

#### 9.5 常见坑

| 症状 | 原因 | 解决 |
| --- | --- | --- |
| **推送后网站没变** | 浏览器 / CDN 缓存 | `Ctrl+Shift+R` 硬刷新；或等 1 分钟 |
| **笔记列表不显示新笔记** | 忘了跑 `npm run build:notes` | 跑一下，再 push `data/51_notes-index.json` |
| **某些图 404** | 路径写错 / 文件没 push 上去 | 看 `git status`，确认图片在 `images/` 下且没被 `.gitignore` 排除 |
| **`/notes/` 显示空白** | sentinel 跳 login 死循环 / 密码门 cfg 问题 | F12 看控制台报错；检查 `data/52_notes-gate.json` 格式 |
| **GitHub 顶部显示"Failed to deploy"** | Jekyll 误处理下划线开头的文件等 | 确认根目录有空文件 `.nojekyll`（本项目已带） |
| **路径里带空格 / 中文 404** | URL 编码问题 | 文件名改成英文小写连字符（如 `motor-control-1.jpg`） |
| **首次 push 报 `unable to access ... 443`** | 网络 / 代理 | 配置 git 代理或换 SSH 协议；或用 GitHub CLI 登录 |

#### 9.6 自定义域名（进阶，可选）

如果你买了自己的域名（如 `yuanxiuwei.com`）：

1. 仓库 Settings → Pages → **Custom domain** 填 `yuanxiuwei.com` → Save
2. 在你的域名服务商加 DNS 记录：
   - A 记录指向 GitHub Pages IP：`185.199.108.153 / 109 / 110 / 111`
   - 或 CNAME 指向 `<用户名>.github.io`
3. 等几分钟 DNS 生效，回到 GitHub Pages 设置勾上 **Enforce HTTPS**

#### 9.7 想换密码 / 改内容紧急回滚

```bash
# 撤销最后一次 commit（保留改动）
git reset --soft HEAD~1

# 完全回到上一个 commit（丢弃改动）
git reset --hard HEAD~1

# 推送已经发到远程？需要强推（小心）
git push --force-with-lease
```

普通维护场景几乎用不上，仅紧急情况备查。

---

<a name="english-version"></a>

## English Version

> [中文](#中文版) ｜ **English**

### 1. Overview

A **fully static, data-driven** personal portfolio website. All displayed content lives in JSON files under `data/`, and pages are rendered dynamically by the scripts in `js/`.

> **Core idea: to change content, edit only `data/*.json` — no need to touch HTML / JS.**

Key features:

- **Data-driven** — content is separated from code; all copy is maintained in JSON.
- **Bilingual (zh/en)** — any text field may be a plain string or a `{ "zh": "...", "en": "..." }` object. Toggle live with the "EN / 中" button in the navbar.
- **Dark / light theme** — one-click toggle, preference stored in `localStorage`.
- **Responsive** — adapts to desktop and mobile (nav collapses into a hamburger menu).
- **Project detail pages** — every project has its own page (Background / Scope / Results / Contribution + sidebar).
- **Personal knowledge notes** — a standalone `/notes/` subsite with 6 categories, live search, and tag filtering. Write notes in plain Markdown — code highlight, math formulas, auto TOC, prev/next, related, reading progress, and image lightbox all work out of the box.
- **Scroll-reveal animations + active-section nav highlighting (scrollspy).**

### 2. Directory Structure

```raw
5personal_page/
├── index.html              # Main-site homepage shell (containers filled by JS)
├── package.json            # Build script entry (npm run build:notes)
├── README.md               # This file
├── css/
│   ├── style.css           # Main-site design system
│   └── notes.css           # Knowledge-notes styles (typography / code / TOC)
├── js/
│   ├── render.js           # Main-site renderer
│   ├── render-project.js   # Project detail renderer (by ?id=)
│   ├── render-notes-list.js # Notes index renderer (search / categories / list)
│   ├── render-note.js      # Single-note renderer (marked + hljs + KaTeX + TOC)
│   └── main.js             # Theme / language toggle, menu, scrollspy, animations
├── data/                   # ★ All structured content lives here ★ filenames are prefixed by page-section order
│   ├── 00_site.json        # nav / footer / logo / defaults
│   ├── 01_hero.json
│   ├── 02_about.json       # → §01 About
│   ├── 03_education.json   # → §02
│   ├── 04_experience.json  # → §03
│   ├── 05_projects.json    # → §04
│   ├── 06_activities.json  # → §05
│   ├── 07_skills.json      # → §06
│   ├── 08_publications.json # → §07
│   ├── 09_life.json        # → §08
│   ├── 10_contact.json     # → §09
│   ├── 50_notes-meta.json  # Notes categories (hand-written)
│   ├── 51_notes-index.json # Notes index (generated by build-notes.js)
│   ├── 52_notes-gate.json  # Notes password-gate config (set-notes-password)
│   └── 99_status.json      # Spare status data (not used)
├── projects/
│   └── project.html        # Project detail page shell
├── notes/                  # ★ Knowledge notes subsite ★
│   ├── index.html          # Notes home (search / category cards / list / tags)
│   ├── note.html           # Single-note page (?id=<category>/<slug>)
│   └── content/            # Your Markdown source files
│       ├── motor-control/
│       ├── domain-control/
│       ├── deep-learning/
│       ├── automotive-security/
│       ├── tools/
│       └── papers/
├── tools/
│   └── build-notes.js      # Scans notes/content/**/*.md → notes-index.json
├── images/
│   ├── placeholder.svg     # Generic placeholder (dark engineering vibe)
│   └── placeholder-photo.svg  # Photo placeholder (hero / life sections)
└── .claude/
    └── launch.json         # Local preview server config (port 8131)
```

Main-site section order (titles numbered 01–09):
**About → Education → Experience → Projects → Activities → Skills → Honors → Life → Contact**

The navbar also has a **"Notes"** entry that jumps into `/notes/`.

### 3. Running Locally

The site reads local JSON via the browser's `fetch`, so it **must be served over HTTP** (opening `index.html` directly will fail to load data due to cross-origin restrictions).

Python is not installed on this machine, so use **Node.js** (pick one):

```bash
# Option A: http-server (recommended)
cd 5personal_page
npx -y http-server -p 8131 -c-1

# Option B: serve, if installed
npx -y serve -l 8131
```

Then open `http://localhost:8131/` in your browser.

> You can also use the VS Code **Live Server** extension: right-click `index.html` → "Open with Live Server".

### 4. Editing Content

> Bilingual syntax: any copy can be `"a plain string"` or `{ "zh": "中文", "en": "English" }`.
> If only one language is provided, switching languages falls back to the available one.

- **Name / title / intro** — edit `data/01_hero.json`.
- **About / info card** — edit `data/02_about.json` (`avatar` = path to your photo).
- **Education / experience / activities** — edit `education.json` / `experience.json` / `activities.json`.
  - Timeline entries accept either `description` (a paragraph) or `bullets` (an array of points).
- **Skills** — edit `skills.json` (add/remove tags per category).
- **Honors & awards** — edit `publications.json` (left column `publications` = scholarships, right column `awards` = competitions/honors).
- **Contact** — edit `contact.json`.
- **Site title / nav / footer / default lang & theme** — edit `site.json`
  (`defaultLang` = `"zh"`/`"en"`, `defaultTheme` = `"light"`/`"dark"`).

#### Adding a project

Append an item to the `items` array in `data/05_projects.json` (see the annotated example in the Chinese section above). **Available `icon` values:** `monitor`, `clock`, `team`, `book`, `award`, `user`, `cpu`, `shield`, `radio`, `wrench`.

### 5. Knowledge Notes (`/notes/`)

The knowledge notes module is a standalone subsite for hosting Markdown notes. Hit `http://localhost:8131/notes/` directly, or click the **"Notes"** entry in the main navbar.

#### 5.1 Page layout

- **`/notes/index.html`** — Notes home
  - Mini hero + live search box (press `/` to focus)
  - **[01] Categories** — 6 category cards with per-category note counts
  - **[02] Recent updates / Search results** — list, newest first
  - **[03] Popular tags** — tag cloud, click to filter
- **`/notes/note.html?id=<category>/<slug>`** — Single note
  - Left main column (720 px reading width) + right sticky **auto TOC**
  - Top breadcrumb: Notes / Category / Title
  - Meta: published, updated, reading time, word count
  - Slim **reading-progress bar** at top, **copy** button on every code block
  - Click any image to **lightbox-zoom**
  - Bottom: **previous / next** cards + **related** (same category + shared tags)

#### 5.2 Writing a new note

**Step 1.** Create a `.md` file under `notes/content/<category>/`. The filename becomes the URL slug — use lowercase + hyphens:

```raw
notes/content/motor-control/my-new-note.md
                                ↑↑↑↑↑↑↑↑↑↑
                                URL: ?id=motor-control/my-new-note
```

**Step 2.** Add **YAML frontmatter** at the top:

```markdown
---
title: Your note title
date: 2026-05-31
updated: 2026-05-31
category: motor-control     # must match the directory
tags: [foc, tip, debug]
summary: One-sentence summary, shown on the index list.
draft: false                # true = not indexed
---

## First section
Body…
```

**Step 3.** Supported Markdown:

| Syntax | Result |
|---|---|
| `# / ## / ###` | Headings (h2/h3 auto-included in TOC with anchor ids) |
| `**bold**` `_italic_` | Bold / italic |
| `` `code` `` | Inline code (accent color) |
| ` ```lang ` fenced blocks | Auto highlight.js syntax highlighting |
| `[text](url)` | Links (relative paths like `?id=other-note` supported) |
| `![alt](path)` | Images (rounded border, click to zoom) |
| Tables | GFM tables (alternating row colors) |
| `> quote` | Blockquote (left orange bar) |
| `$...$` / `$$...$$` | KaTeX math (inline / block) |
| `---` | Horizontal rule |
| `- [ ]` | Task lists |

**Step 4.** Rebuild the index:

```bash
npm run build:notes
# or: node tools/build-notes.js
```

The script scans every `.md`'s frontmatter and writes `data/51_notes-index.json` sorted by `updated`. The console prints what was indexed.

**Step 5.** Refresh the browser. Before pushing to GitHub Pages, remember to rebuild the index and `git add data/51_notes-index.json`.

#### 5.3 Managing categories

Category names, icons, and descriptions live in `data/50_notes-meta.json`:

```jsonc
{
  "categories": [
    {
      "id": "motor-control",          // must match notes/content/<id>/ dir
      "name": { "zh": "电机控制", "en": "Motor Control" },
      "icon": "cpu",                  // cpu / monitor / brain / shield / wrench / book
      "color": "#ff6a00",
      "description": { "zh": "…", "en": "…" }
    }
  ]
}
```

**Adding a new category:**
1. Create a new directory under `notes/content/`.
2. Add a matching entry to `categories` in `data/50_notes-meta.json` (with the same `id`).
3. Drop `.md` files in, then `npm run build:notes`.

#### 5.4 Recommended writing workflow

See the [`notes/content/tools/vscode-tips.md`](notes/content/tools/vscode-tips.md) sample for a concrete walk-through:

- Open the repo root in **VS Code**.
- Install **Markdown All in One** + **Markdown Preview Enhanced** + **Paste Image**.
- `Ctrl+Shift+V` to open the side preview.
- Paste screenshots with `Ctrl+Alt+V` (auto-saves to a sibling `img/` folder).
- When done: `npm run build:notes` → `git push`.

#### 5.5 Deploying to GitHub Pages

Notes and the main site share the same repo, deployed the same way:

```bash
# One-off: in GitHub repo Settings → Pages → Source pick "main"
touch .nojekyll                     # avoid Jekyll preprocessing
git add .nojekyll
```

Day-to-day push:

```bash
npm run build:notes                 # 1. refresh the index
git add notes/ data/51_notes-index.json
git commit -m "notes: add xxx note"
git push
```

> ⚠️ Both the main site **and** the notes module are **publicly visible** on GitHub Pages. All `.md` content is open to anyone — make sure nothing sensitive is in there before pushing.

### 6. Extension Points (incl. image slots)

| Where | File / field | Notes |
| --- | --- | --- |
| Avatar | `data/02_about.json` → `avatar` | Empty by default (shows a placeholder icon). Drop a photo into `images/` and set the path. |
| Project cover | `data/05_projects.json` → each `cover` | Empty shows only the icon; set a path to show a cover at the top of the card. |
| Project detail images | `data/05_projects.json` → `detail.images` | The "Hybrid Powertrain" project includes one placeholder image as an example; replace with Simulink diagrams / host-tool screenshots / car photos, etc. |
| CV download | `data/10_contact.json` → `cta.buttonHref` | Currently `"#"`. Put your CV PDF in the folder and set the path to enable the button. |
| Generic placeholder | `images/placeholder.svg` | Can be referenced temporarily in any image slot. |
| Quantitative metrics | project details in `projects.json` | Spots without resume data are marked "to be added"; fill in real numbers when available. |

> For images: feel free to source/generate suitable ones, or use `images/placeholder.svg` as a temporary stand-in.

### 7. Maintenance Guide (step-by-step)

> This section is for day-to-day maintenance — every step tells you which file to open, which line to change, and where to see the effect. No front-end knowledge required.

#### 7.1 Two concepts to know first

**① Bilingual fields.** Most text fields look like:
```json
"title": { "zh": "中文标题", "en": "English Title" }
```
Toggle EN / 中 in the navbar and the field follows. A plain string `"title": "..."` is shown in both languages. If only one of `zh`/`en` is provided, the other language falls back to it.

**② How edits take effect.**
1. Save the file (`Ctrl+S`)
2. **Hard-refresh** the browser (`Ctrl+Shift+R` / `Ctrl+F5`)
3. No server restart needed
4. After editing `.md` notes, run `npm run build:notes` first

#### 7.2 JSON file → page area mapping

| File | Controls | What you can change |
| --- | --- | --- |
| `data/00_site.json` | Top nav + footer + logo + page title | Menu items, logo, site name, footer tagline |
| `data/01_hero.json` | First-screen hero | Name, title, **hero side image**, Key Verticals card |
| `data/02_about.json` | **01 About** | Intro paragraphs, info card, **avatar** |
| `data/03_education.json` | **02 Education** | Add / remove schools |
| `data/04_experience.json` | **03 Experience** | Add / remove internships |
| `data/05_projects.json` | **04 Projects** + detail pages | Add / remove projects, covers, detail images |
| `data/06_activities.json` | **05 Activities** + bottom banner | Roles, bullets, banner image |
| `data/07_skills.json` | **06 Skills** | Categories and tags |
| `data/08_publications.json` | **07 Honors & Awards** | Scholarships + competitions/honors |
| `data/09_life.json` | **08 Personal Life** | Bio, info table, hobby chips, **4 life photos** |
| `data/10_contact.json` | **09 Contact** | Email, phone, CV download |
| `data/50_notes-meta.json` | Notes — category meta | Category names, add a category |
| `data/51_notes-index.json` | Notes — index | **Don't hand-edit** — regenerated by `npm run build:notes` |

#### 7.3 How to edit each section

Each main-site section follows the same pattern — open the JSON, edit the relevant key, save, refresh.

- **Hero**: `data/01_hero.json` → `name` / `title` / `description` / `images[]` (array — ≥ 2 entries enables auto-carousel) / `carousel` `{interval, pauseOnHover}` / `verticals.items` (3–4 bullets). Legacy `image` (single) still works.
- **About**: `data/02_about.json` → `paragraphs[]`, `info[]`, **`avatar`** (path to your photo)
- **Timeline-style (Education / Experience / Activities)**: each entry uses `school` / `period` / `degree` and either `description` (a paragraph) or `bullets[]` (array of points), plus `tags[]`. Activities also has a `banner` block with `image`, `eyebrow`, and `title`.
- **Projects**: each item in `projects.json` has `id` / `title` / `summary` / `icon` / `cover` / `tech[]` / `detail{...}`. The `detail.sections[]` array supports `type: "paragraph"` and `type: "list"`, and `detail.images[]` lays images out in a 2-column grid. **Available icons:** `monitor / clock / team / book / award / user / cpu / shield / radio / wrench`.
- **Skills**: `categories[].skills[]` — strings or `{zh, en}` objects.
- **Publications**: left column = `publications[]` (scholarships), right = `awards[]` (year-as-badge + title + meta).
- **Life**: `intro.paragraph` + `info[]` + `hobbies[]` (icons: `bike / run / ball / paddle / shuttlecock / mountain / camera / book / music / coffee`) + optional bottom `banner` + **`photos[]`** (4 entries: `icon`, `title`, `description`, **`images[]`** array). Each photo slot auto-carousels when its `images[]` has ≥ 2 entries. Shared `carousel` `{interval, pauseOnHover}` at top level controls timing. Legacy `src` (single) still works.
- **Contact**: `links[]` (email / phone / etc.), and `cta.buttonHref` → path to your CV PDF.
- **Site / Nav / Footer**: `data/00_site.json` → `logo`, `nav[]`, `footer.tagline`, `footer.copyright`.

#### 7.4 Image management

> **What formats are supported?** Any image format the browser natively understands — `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`, `.gif`, `.svg`. The renderer just uses a plain `<img>` tag. The bundled `.svg` placeholders are only there because they're small and ship a nice fallback graphic; replace them with any jpg / png / webp you like.

> **How are images fitted to slots?** All image slots use `object-fit: contain` — the **full image is always shown**, scaled proportionally. Letterboxed space around the photo is filled with a **blurred copy of the same image** (Apple-Music-style "blurred backdrop"), so the slot never feels empty regardless of source aspect ratio. To make a slot edge-to-edge crop instead, change `object-fit: contain` → `cover` for the relevant rule in `css/style.css`.

**Where**: drop everything into `images/`.

**Recommended sizes**:

| Use | Size | Ratio | Max KB |
| --- | --- | --- | --- |
| Hero side image | ~1200×1020 | ~4:3.4 | 500 |
| Avatar | 400×400+ | 1:1 | 200 |
| Project cover | 1200×750 | 16:10 | 400 |
| Project detail image | 1200×800 | 3:2 flex | 500 |
| Activities banner | 1600×500 | 16:5 | 600 |
| Life photo | 1200×900 | 4:3 | 300 |

Use [TinyPNG](https://tinypng.com/) / [Squoosh](https://squoosh.app/) to compress.

**4-step recipe to drop a new image into the page**:

1. Save the image (resized + compressed) as e.g. `engine.jpg`.
2. Copy it into `images/`.
3. Edit the relevant JSON field with the path (e.g. `"image": "images/engine.jpg"` in `hero.json`).
4. Hard-refresh the browser.

**Quick image-slot lookup table**:

| Where to swap | JSON file | Field | Carousel? |
| --- | --- | --- | --- |
| Hero side image | `data/01_hero.json` | `images[]` (legacy `image` ok) | **✅ ≥ 2 images auto-rotate** |
| About avatar | `data/02_about.json` | `avatar` | single |
| Project N cover | `data/05_projects.json` | item N → `cover` | single |
| Project N detail images | `data/05_projects.json` | item N → `detail.images[]` | grid, no rotation |
| Life photo slot N | `data/09_life.json` | `photos[N-1].images[]` (legacy `src` ok) | **✅ ≥ 2 images auto-rotate** |
| Life bottom banner | `data/09_life.json` | `banner.image` | single |
| CV PDF (not an image) | `data/10_contact.json` | `cta.buttonHref` | — |
| Image inside a note | the `.md` file directly: `![alt](./img/xxx.jpg)` | put image in `img/` next to the `.md` | — |

**Carousel timing** (hero & life slots) — edit `carousel` block in the relevant JSON:

```jsonc
"carousel": {
  "interval":     5000,   // ms between auto-advance (default 5000 = 5s)
  "pauseOnHover": true    // pause auto-play while pointer is over the image
}
```

Hero (`data/01_hero.json`) and Life (`data/09_life.json`) have independent `carousel` configs. The 4 life-photo slots share one config. To disable a carousel on one slot, keep its `images[]` array at length 1 (or use the legacy `src` field). Built-in interactions (no extra config needed): hover-revealed prev/next chevrons, clickable bottom dots, 0.6s opacity crossfade between slides.

If you don't have a real image yet, use `images/placeholder.svg` or `images/placeholder-photo.svg` as a temporary stand-in.

#### 7.5 Adding a note (5-step recap)

See §5 for the full version. Short version:

1. Pick a category dir under `notes/content/<category>/`.
2. Create a new `.md` with a lowercase-hyphen filename (`my-new-note.md` → URL `?id=<cat>/my-new-note`).
3. Add YAML frontmatter (`title`, `date`, `updated`, `category`, `tags`, `summary`).
4. Run `npm run build:notes` from the project root.
5. Hard-refresh `http://localhost:8131/notes/`.

#### 7.6 Pre-flight checklist

- [ ] Saved the file (`Ctrl+S`)
- [ ] Hard-refreshed the browser (`Ctrl+Shift+R`)
- [ ] JSON syntax valid — check at [jsonlint.com](https://jsonlint.com)
- [ ] Toggled EN / 中 once to catch missing translations
- [ ] Checked mobile breakpoint (F12 → device toolbar)
- [ ] Toggled dark / light theme once
- [ ] Ran `npm run build:notes` after editing `.md`
- [ ] `git add data/51_notes-index.json` before pushing

### 8. Knowledge Notes Password Gate

#### 8.1 What it does

The `/notes/` subsite is gated by a password screen. Visitors who don't have the password can't reach the notes list or any single note.

⚠️ **Important — this is a client-side gate, not real encryption.**
- ✅ Deters casual visitors and search bots
- ⚠️ Anyone with DevTools can bypass it by fetching `notes/content/<cat>/<slug>.md` directly
- Don't put real secrets behind it. For real encryption see §8.6.

#### 8.2 Default password

```raw
welcome2026
```

Change it the first time you boot the site (see §8.3).

#### 8.3 Changing the password (one command)

From the project root:

```bash
npm run set:password -- mynewstrongpass
# or:
node tools/set-notes-password.js mynewstrongpass
```

What this does:
- Computes `SHA-256(salt + your-password)` and writes the hash into `data/52_notes-gate.json` → `passwordHash`
- The plaintext password is **never written to any file** — you keep it yourself
- Browsers that were already unlocked don't lose access immediately (their localStorage record is still valid). To force the gate to reappear: clear `notes-gate-unlocked-v1` in localStorage or open an incognito window.

**Requirements**: ≥ 6 characters. Strongly recommend ≥ 12 with mixed letters + digits.

#### 8.4 How it works (one picture)

```raw
Visit /notes/  or  /notes/note.html?id=…
        │
        ▼
  Sync sentinel in HTML <head> checks localStorage
        │
        ├── unlocked ────────────────► render notes normally
        │   (valid for `rememberDays`, default 7)
        │
        └── locked ──────────────────► redirect to /notes/login.html?returnTo=…
                                           │
                                           ▼
                                   Enter password → browser computes SHA-256
                                           │
                                           ├── match → write localStorage → redirect back
                                           └── mismatch → shake + error banner
```

Key files:

| File | Role |
| --- | --- |
| `data/52_notes-gate.json` | Hash, salt, remember-days, bilingual labels |
| `notes/login.html` | Login page shell |
| `js/notes-gate.js` | Login logic (SHA-256, form, error states) |
| `notes/index.html` / `notes/note.html` `<head>` inline `<script>` | Sync redirect sentinel |
| `tools/set-notes-password.js` | CLI to change the password |

#### 8.5 Common operations

- **Change "remember me" duration**: edit `"rememberDays": 7` in `data/52_notes-gate.json`.
- **Change wording** (title / subtitle / hint / error / etc.): edit the `{zh, en}` text fields in `data/52_notes-gate.json`.
- **Disable the gate entirely** (make `/notes/` public): set `"enabled": false` in `data/52_notes-gate.json` **and** remove the two sentinel `<script>` blocks at the top of `notes/index.html` and `notes/note.html`.
- **Forgot your password**: just run `npm run set:password -- newpass` — it overwrites the hash without needing the old one.
- **Force re-login on one browser**: DevTools → Application → Local Storage → delete the `notes-gate-unlocked-v1` key (or open an incognito window).

#### 8.6 If you need real encryption

Current limitation: the source files (HTML / JS / `.md`) are static assets on GitHub Pages and **anyone can fetch them directly**. The gate only protects the JS-rendered UI layer.

Real protection options:

- **[staticrypt](https://github.com/robinmoisson/staticrypt)** — AES-256-encrypts HTML / .md files with your password as the key. Adds a `staticrypt encrypt` step to every push but it's real encryption.
- **Private deploy + server auth** (Cloudflare Pages + Functions, Vercel, self-hosted) — server-side check, sources never exposed. Safest but needs a server.

Open an issue / ask if you want to migrate to either.

### 9. Deploying to GitHub Pages

This site is **pure static HTML + JS** with a tiny Node build step (`npm run build:notes`). GitHub Pages is the natural deploy target.

#### 9.1 One-time setup

You need: a GitHub account, [Git](https://git-scm.com), [Node.js](https://nodejs.org), and `git config --global user.{name,email}` set.

**Repo naming** (pick one):

| Option | Final URL | When |
| --- | --- | --- |
| **A. `<username>.github.io`** | `https://<username>.github.io/` | **Recommended** — clean root URL |
| **B. any repo name** | `https://<username>.github.io/<repo>/` | Already have option A used |

Both work; the code uses relative paths and adapts to either.

#### 9.2 First deploy (6 steps)

1. **Create the repo on GitHub.** Login → "New repository" → name it as above → Public → don't tick any of the auto-init options → Create.
2. **Init git locally.**
   cd "F:/6Project_App/5personal_page"
   git init -b main
3. **Final pre-flight.**
   npm run build:notes              # refresh notes index
   npx -y http-server -p 8131 -c-1  # local preview at http://localhost:8131/
   # Browse every section. Ctrl+C when satisfied.
4. **First commit.**
   git add .
   git commit -m "Initial portfolio site"
5. **Push to GitHub.**
   git remote add origin https://github.com/<username>/<repo>.git
   git push -u origin main
   You'll be prompted to authenticate. Easiest: `gh auth login` (GitHub CLI), or generate a Personal Access Token with `repo` scope.
6. **Enable Pages.** Repo → Settings → Pages → Source: **Deploy from a branch** → Branch: `main` / `(root)` → Save. After ~1 minute the site is live.

#### 9.3 Day-to-day updates

```bash
# After editing JSON / .md / images:
npm run build:notes                  # only if you touched .md
npx -y http-server -p 8131 -c-1      # optional local preview

git add .
git status --short                   # check what changed
git commit -m "describe the change"
git push                             # GitHub Pages redeploys in ~30s
```

Hard-refresh the browser (`Ctrl+Shift+R`) to bust CDN cache.

#### 9.4 Pre-flight checklist

- [ ] All files saved
- [ ] Ran `npm run build:notes` if `.md` was touched
- [ ] `data/51_notes-index.json` shows in `git status` after the build
- [ ] Local preview has zero console errors
- [ ] Toggled EN / 中 and dark / light once
- [ ] No accidental sensitive files staged (resumes you didn't mean to publish, secret screenshots, etc.)

#### 9.5 Common pitfalls

| Symptom | Fix |
| --- | --- |
| Site doesn't update after push | Hard-refresh (`Ctrl+Shift+R`); wait 1 min for CDN |
| New note not in list | Run `npm run build:notes`, then commit `data/51_notes-index.json` |
| Some images 404 | Path typo, or file excluded by `.gitignore` — check `git status` |
| GitHub shows "Failed to deploy" | Empty `.nojekyll` file missing at repo root (this repo ships one) |
| Path with spaces / Chinese chars 404 | Rename files to lowercase + hyphens |
| Push fails with `unable to access ... 443` | Network/proxy — try `gh auth login` or SSH protocol |

#### 9.6 Custom domain (optional)

Repo Settings → Pages → Custom domain → enter your domain → Save. Then add the DNS records at your registrar (A records to GitHub Pages IPs `185.199.108.153 / 109 / 110 / 111`, or a CNAME to `<username>.github.io`). After DNS propagates, tick **Enforce HTTPS**.

---

<p align="center"><sub>行稳致远，进而有为 · Stepping forward, achieving greater success</sub></p>
