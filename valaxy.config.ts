import type { UserThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'

// add icons what you will need
const safelist = [
  'i-ri-home-line',
]

/**
 * User Config
 */
export default defineValaxyConfig<UserThemeConfig>({
  // site config see site.config.ts

  theme: 'yun',

  themeConfig: {
    banner: {
      enable: true,
      title: '无限进步',
    },

    pages: [
      {
        name: '分类',
        url: '/categories/',
        icon: 'i-ri-apps-line',
        color: 'dodgerblue',
      },
      {
        name: '标签',
        url: '/tags/',
        icon: 'i-ri-bookmark-3-line',
        color: 'dodgerblue',
      },
    ],

    colors: {
      primary: "#D69B54",
    },

    // 页脚
    footer: {
      since: 2026,
      powered: true, // 显示 Valaxy 驱动信息
      beian: {
        enable: false,
        icp: '',
        police: '',
      },
    },

    // 背景图配置
    bg_image: {
      enable: true, // 启用背景图
      url: "/bg_day.png", // 白日模式背景
      dark: "/bg_dark.png", // 夜间模式背景（可使用同一张）
    },

    // 鼠标点击烟花特效
    fireworks: {
      enable: true,
      colors: ['#FFE57D', '#FFCD88', '#E6F4AD']
    },
  },

  unocss: { safelist },

  siteConfig: {
    // 启用评论（文章中的插件功能，已禁用）
    comment: {
      enable: false // 不使用评论功能
    },
  },
})
