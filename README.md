# Valaxy Blog

[English](#english) | [简体中文](#简体中文)

---

<a name="english"></a>
## English

> A modern static blog built with [Valaxy](https://github.com/YunYouJun/valaxy) framework and [Yun Theme](https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-theme-yun).

[![Valaxy](https://img.shields.io/badge/Valaxy-0.27.0-blue)](https://github.com/YunYouJun/valaxy)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

### ✨ Features

- **🎨 Modern Design**: Beautiful Yun theme with responsive layout
- **🌓 Dark Mode**: Automatic dark/light mode switching
- **📝 Markdown Support**: Write posts in Markdown with frontmatter
- **🏷️ Categories & Tags**: Organize content with categories and tags
- **🔍 Built-in Search**: Full-text search functionality
- **⏱️ Reading Time**: Automatic reading time estimation
- **🎆 Visual Effects**: Mouse click fireworks effect
- **📱 PWA Support**: Progressive Web App capabilities
- **🚀 Multiple Deployment**: GitHub Pages, Netlify, Vercel, Docker support

### 🚀 Quick Start

#### Prerequisites

- Node.js >= 18
- pnpm (recommended) or npm

#### Installation

```bash
# Clone the repository
git clone https://github.com/sencls/sencls.github.io.git
cd sencls.github.io

# Install dependencies
pnpm install
```

#### Development

```bash
# Start development server
pnpm dev
```

Visit `http://localhost:4859/` to see your blog.

#### Build

```bash
# Build for production
pnpm build

# Preview production build
pnpm serve
```

### 📁 Project Structure

```
valaxy-blog/
├── .valaxy/          # Valaxy generated files
├── .github/          # GitHub workflows
├── components/       # Custom Vue components
├── layouts/          # Custom layout files
├── locales/          # i18n language files
├── pages/            # Blog pages
│   ├── posts/        # Blog posts
│   ├── about/        # About page
│   ├── archives/     # Archives page
│   ├── categories/   # Categories page
│   ├── tags/         # Tags page
│   └── links/        # Friend links page
├── public/           # Static assets
├── styles/           # Custom styles
├── site.config.ts    # Site configuration
└── valaxy.config.ts  # Valaxy theme configuration
```

### ⚙️ Configuration

#### Site Config (`site.config.ts`)

Configure your site's basic information:

```typescript
export default defineValaxyConfig({
  title: 'Your Blog Title',
  description: 'Your blog description',
  lang: 'en',
  url: 'https://yourusername.github.io/',
  author: {
    name: 'Your Name',
    avatar: '/avatar.png',
  },
})
```

#### Theme Config (`valaxy.config.ts`)

Customize the theme appearance and features:

```typescript
export default defineValaxyConfig({
  theme: 'yun',
  themeConfig: {
    banner: { title: 'Your Banner' },
    colors: { primary: '#D69B54' },
    bg_image: { enable: true },
  },
})
```

### 📦 Writing Posts

Create a new markdown file in `pages/posts/`:

```markdown
---
title: Hello World
date: 2024-01-01
tags: [foo, bar]
categories: [example]
cover: /cover-image.png
---

# Your content here

Write your blog post in Markdown...
```

### 🚢 Deployment

#### GitHub Pages

1. Push your code to GitHub
2. Enable GitHub Pages in repository settings
3. The GitHub Actions workflow will auto-deploy

#### Netlify

Connect your repository to Netlify with the following settings:

- Build command: `pnpm build`
- Publish directory: `dist`

#### Vercel

Connect your repository to Vercel with default settings.

#### Docker

```bash
docker build . -t your-blog-name:latest
docker run -p 80:80 your-blog-name:latest
```

### 🛠️ Customization

#### Custom Styles

Add your custom styles in `styles/index.scss`:

```scss
// Your custom styles
.custom-class {
  color: #your-color;
}
```

#### Custom Components

Place Vue components in `components/` directory - they will be auto-registered.

#### i18n

Add language files in `locales/` directory:

```yaml
# locales/en.yml
hello: Hello World
```

### 📚 Resources

- [Valaxy Documentation](https://valaxy.site)
- [Yun Theme Documentation](https://yun.yunyoujun.cn)
- [Valaxy GitHub](https://github.com/YunYouJun/valaxy)

### 📄 License

This project is open source and available under the [MIT License](LICENSE).

### 💝 Thanks

- [Valaxy](https://github.com/YunYouJun/valaxy) - The amazing blog framework
- [Yun Theme](https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-theme-yun) - Beautiful theme design

---

<a name="简体中文"></a>
## 简体中文

> 基于 [Valaxy](https://github.com/YunYouJun/valaxy) 框架和 [Yun 主题](https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-theme-yun) 构建的现代化静态博客。

[![Valaxy](https://img.shields.io/badge/Valaxy-0.27.0-blue)](https://github.com/YunYouJun/valaxy)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

### ✨ 特性

- **🎨 现代设计**：精美的 Yun 主题，响应式布局
- **🌓 深色模式**：自动切换深色/浅色主题
- **📝 Markdown 支持**：使用 Markdown 编写文章，支持 Frontmatter
- **🏷️ 分类与标签**：通过分类和标签整理内容
- **🔍 内置搜索**：全文搜索功能
- **⏱️ 阅读时长**：自动估算文章阅读时间
- **🎆 视觉特效**：鼠标点击烟花效果
- **📱 PWA 支持**：渐进式 Web 应用功能
- **🚀 多平台部署**：支持 GitHub Pages、Netlify、Vercel、Docker

### 🚀 快速开始

#### 环境要求

- Node.js >= 18
- pnpm（推荐）或 npm

#### 安装

```bash
# 克隆仓库
git clone https://github.com/sencls/sencls.github.io.git
cd sencls.github.io

# 安装依赖
pnpm install
```

#### 开发

```bash
# 启动开发服务器
pnpm dev
```

访问 `http://localhost:4859/` 查看你的博客。

#### 构建

```bash
# 生产环境构建
pnpm build

# 预览构建结果
pnpm serve
```

### 📁 项目结构

```
valaxy-blog/
├── .valaxy/          # Valaxy 自动生成的文件
├── .github/          # GitHub 工作流
├── components/       # 自定义 Vue 组件
├── layouts/          # 自定义布局文件
├── locales/          # 国际化语言文件
├── pages/            # 博客页面
│   ├── posts/        # 博客文章
│   ├── about/        # 关于页面
│   ├── archives/     # 归档页面
│   ├── categories/   # 分类页面
│   ├── tags/         # 标签页面
│   └── links/        # 友情链接页面
├── public/           # 静态资源
├── styles/           # 自定义样式
├── site.config.ts    # 站点配置
└── valaxy.config.ts  # Valaxy 主题配置
```

### ⚙️ 配置

#### 站点配置 (`site.config.ts`)

配置站点基本信息：

```typescript
export default defineValaxyConfig({
  title: '你的博客标题',
  description: '你的博客描述',
  lang: 'zh-CN',
  url: 'https://yourusername.github.io/',
  author: {
    name: '你的名字',
    avatar: '/avatar.png',
  },
})
```

#### 主题配置 (`valaxy.config.ts`)

自定义主题外观和功能：

```typescript
export default defineValaxyConfig({
  theme: 'yun',
  themeConfig: {
    banner: { title: '横幅文字' },
    colors: { primary: '#D69B54' },
    bg_image: { enable: true },
  },
})
```

### 📦 撰写文章

在 `pages/posts/` 目录下创建新的 Markdown 文件：

```markdown
---
title: 你好世界
date: 2024-01-01
tags: [标签一, 标签二]
categories: [分类]
cover: /cover-image.png
---

# 你的内容

在这里用 Markdown 编写你的博客文章...
```

### 🚢 部署

#### GitHub Pages

1. 将代码推送到 GitHub
2. 在仓库设置中启用 GitHub Pages
3. GitHub Actions 工作流将自动部署

#### Netlify

将仓库连接到 Netlify，配置如下：

- 构建命令：`pnpm build`
- 发布目录：`dist`

#### Vercel

将仓库连接到 Vercel，使用默认设置。

#### Docker

```bash
docker build . -t your-blog-name:latest
docker run -p 80:80 your-blog-name:latest
```

### 🛠️ 自定义

#### 自定义样式

在 `styles/index.scss` 中添加自定义样式：

```scss
// 你的自定义样式
.custom-class {
  color: #your-color;
}
```

#### 自定义组件

将 Vue 组件放在 `components/` 目录下 - 它们会自动注册。

#### 国际化

在 `locales/` 目录下添加语言文件：

```yaml
# locales/zh-CN.yml
hello: 你好世界
```

### 📚 相关资源

- [Valaxy 官方文档](https://valaxy.site)
- [Yun 主题文档](https://yun.yunyoujun.cn)
- [Valaxy GitHub](https://github.com/YunYouJun/valaxy)

### 📄 开源协议

本项目基于 [MIT License](LICENSE) 开源。

### 💝 致谢

- [Valaxy](https://github.com/YunYouJun/valaxy) - 惊人的博客框架
- [Yun Theme](https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-theme-yun) - 精美的主题设计
