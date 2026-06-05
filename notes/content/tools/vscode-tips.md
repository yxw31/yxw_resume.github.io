---
title: VS Code 写 Markdown 笔记的几个提速插件
date: 2026-05-30
updated: 2026-05-30
category: tools
tags: [vscode, markdown, productivity]
summary: 把 VS Code 配成一个比 Typora 更顺手的 Markdown 笔记环境，关键是 5 个插件 + 2 个快捷键。
---

## 我的目标

- 写起来比 Typora 还顺
- 文件归自己管（不绑定第三方）
- 表格、数学公式、代码块都自然
- 实时预览不要太占地方

## 必装 5 插件

| 插件 | 作用 |
|---|---|
| **Markdown All in One** | 自动列表续行、表格格式化、TOC、键盘快捷键 |
| **Markdown Preview Enhanced** | 比内置预览强很多：mermaid、数学公式、自定义 CSS |
| **markdownlint** | 实时提示格式问题（标题层级、空行等）|
| **Paste Image** | 截图直接 Ctrl+Alt+V 贴成图片文件 + 自动写路径 |
| **Code Spell Checker** | 拼写检查，可选装中文词典 |

## 必改 3 个快捷键

`Ctrl+Shift+P` → "Preferences: Open Keyboard Shortcuts (JSON)" → 加：

```json
[
  {
    "key": "ctrl+b",
    "command": "markdown.extension.editing.toggleBold",
    "when": "editorTextFocus && editorLangId == 'markdown'"
  },
  {
    "key": "ctrl+i",
    "command": "markdown.extension.editing.toggleItalic",
    "when": "editorTextFocus && editorLangId == 'markdown'"
  },
  {
    "key": "ctrl+shift+v",
    "command": "markdown-preview-enhanced.openPreviewToTheSide"
  }
]
```

## 一个不广为人知的技巧：列对齐表格

当表格列宽不齐时，把光标放在表格里，按 `Ctrl+Shift+P` → "Format Document"。Markdown All in One 会自动对齐。

或者直接装 [Markdown Table Editor](https://marketplace.visualstudio.com/items?itemName=takumii.markdowntable)，Tab 移动单元格、自动对齐。

## Paste Image 配置

在工作区根目录建 `.vscode/settings.json`：

```json
{
  "pasteImage.path": "${currentFileDir}/img",
  "pasteImage.basePath": "${currentFileDir}",
  "pasteImage.forceUnixStyleSeparator": true,
  "pasteImage.prefix": "./",
  "pasteImage.namePrefix": "${currentFileNameWithoutExt}-",
  "pasteImage.nameSuffix": "",
  "pasteImage.defaultName": "Y-MM-DD-HH-mm-ss"
}
```

效果：截图 → `Ctrl+Alt+V` → 自动存到当前文件同级 `img/` 下，文件名带笔记名前缀，路径自动写进 markdown。

## 数学公式

用 KaTeX 语法（`$...$` 行内，`$$...$$` 块）。Markdown Preview Enhanced 默认支持。

```
$$
F = m \cdot a
$$
```

部署到我自己网站时也用 KaTeX，**写一次，本地预览和线上一致**。

## 我现在的写作流

1. VS Code 打开知识库根目录
2. 新建 `notes/content/<category>/<slug>.md`
3. 顶部写 frontmatter（用 snippet）
4. 边写边 `Ctrl+Shift+V` 看预览
5. 提交 git，push 自动部署

snippet 提示：在 `.vscode/markdown.code-snippets` 写一个 frontmatter 模板：

```json
{
  "Note Frontmatter": {
    "prefix": "fm",
    "body": [
      "---",
      "title: $1",
      "date: $CURRENT_YEAR-$CURRENT_MONTH-$CURRENT_DATE",
      "updated: $CURRENT_YEAR-$CURRENT_MONTH-$CURRENT_DATE",
      "category: ${2|motor-control,domain-control,deep-learning,automotive-security,tools,papers|}",
      "tags: [$3]",
      "summary: $4",
      "---",
      "",
      "## $5",
      "$0"
    ]
  }
}
```

输入 `fm` + Tab → 整个 frontmatter 模板出现。
