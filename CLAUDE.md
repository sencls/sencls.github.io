# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

基于 **Valaxy v0.27.0** + **valaxy-theme-yun** 的个人技术博客，内容以 C++、游戏开发为主。部署在 GitHub Pages。

## 常用命令

```bash
pnpm dev          # 启动开发服务器 (localhost:4859)
pnpm build        # SSG 静态站点生成 (生产构建)
pnpm build:spa    # SPA 模式构建
pnpm serve        # 预览生产构建
pnpm rss          # 生成 RSS 订阅文件
```

## 项目结构

```
pages/
  posts/           # 博客文章 (.md)
  about/           # 关于页面
  archives/        # 归档页
  categories/      # 分类页
  tags/            # 标签页
  links/           # 友链页
public/            # 静态资源 (图片、favicon、PWA 资源)
styles/            # 自定义 SCSS 样式
components/        # 自定义 Vue 组件 (自动注册)
layouts/           # 自定义布局
locales/           # i18n 翻译文件
site.config.ts     # 站点元信息 (标题、作者、社交链接、评论、搜索)
valaxy.config.ts   # 主题配置 (横幅、颜色、背景图、特效、页脚)
```

## 博客文章编写规范

### 文件位置

在 `pages/posts/` 下创建 `.md` 文件，文件名即为 URL 路径的一部分（支持中文文件名）。

### Frontmatter 格式

```yaml
---
title: 文章标题
date: YYYY-MM-DD          # 发布日期，必填
updated: YYYY-MM-DD       # 更新日期，可选
categories: 分类名         # 单个分类，不支持数组
tags:                      # 标签列表
  - 标签1
  - 标签2
cover: /images/cover.jpg   # 封面图，可选。支持本地路径或外部 URL
---
```

**注意事项：**
- `categories` 为单个字符串，不是数组（如 `categories: C++`）
- `tags` 为 YAML 数组格式
- `date` 和 `updated` 格式为 `YYYY-MM-DD`
- `cover` 可使用 `public/` 下的本地路径（以 `/` 开头）或外部 URL

### 图片使用

- **本地图片**：放在 `public/` 目录下，文章中用绝对路径引用（如 `![描述](/images/xxx.png)`）
- **外部图片**：直接使用完整 URL
- **封面图**：通过 frontmatter 的 `cover` 字段设置
- **背景图**：在 `valaxy.config.ts` 的 `bg_image` 中配置日间/夜间模式图片

### 视频链接

Markdown 标准语法支持：
```markdown
[![视频描述](视频封面图URL)](视频链接)
```
也可直接嵌入 HTML `<iframe>` 标签（如 B 站视频嵌入代码）。

### 当前文章分类与标签体系

| 分类 | 标签覆盖 |
|------|---------|
| C++ | C++, 内存管理, 智能指针, 左值, 右值, 完美转发, 函数指针, Lambda, 仿函数, 模板, 元编程, 特化, SFINAE, 设计模式, 单例, 多线程, STL, 容器, 数据结构 |
| (游戏开发) | 游戏开发, 架构设计, EasyX, 教程 |

新增文章时复用已有标签保持一致性，或按需添加新标签。

## 关键配置

### site.config.ts — 站点信息
- `url`: 站点 URL
- `title` / `subtitle`: 站点标题与副标题
- `author`: 博主名称、头像 (`/avater.png`)、状态 emoji
- `social`: 社交链接数组（RSS、GitHub、B 站等），图标使用 `i-ri-xxx` 前缀的 Remix Icon
- `search.enable`: 全文搜索开关
- `comment.enable`: 评论功能开关（当前关闭）
- `statistics.enable`: 阅读时间统计（中文 300 字/分钟，英文 200 词/分钟）

### valaxy.config.ts — 主题外观
- `banner`: 首页横幅标题
- `colors.primary`: 主题色（当前 `#D69B54`）
- `bg_image`: 背景图（日间 `/bg_day.png`、夜间 `/bg_dark.png`）
- `fireworks`: 鼠标点击烟花特效
- `pages`: 导航栏页面配置（名称、URL、图标、颜色）
- `footer.since`: 建站年份

## 部署

支持 Docker、Netlify、Vercel 多平台部署，配置文件分别为 `Dockerfile`、`netlify.toml`、`vercel.json`。
