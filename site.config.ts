import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  url: 'https://sencls.github.io/',  //你网站的URL
  favicon: "",	// 网页图标链接
  lang: 'zh-CN',  //默认语言
  title: "sencl的世界",  //网站标题
  subtitle: '存在的理由 不假外求',//网站副标题
  author: {
    name: 'sencl',//博主名称
    avatar: "",	//头像链接
    status: {
      emoji: '💛'	// 头像旁边的emoji
    },
  },

  description: '',  //简介
  social: [
    {
      name: 'RSS',
      link: '/atom.xml',  //这个是博客自带的RSS订阅，尽量留着，方便其他博友为你订阅
      icon: 'i-ri-rss-line',
      color: 'orange',
    },
       {
      name: 'GitHub',
      link: 'https://github.com/sencls',  //这里填写你的GitHub地址，不需要的话删除此字段即可
      icon: 'i-ri-github-line',
      color: '#6e5494',
    },
    {
      name: '哔哩哔哩',
      link: 'https://space.bilibili.com/671045761?spm_id_from=333.1007.0.0',  //这里填写你的BiliBili地址，不需要的话删除此字段即可
      icon: 'i-ri-bilibili-line',
      color: '#FF8EB3',
    },
  
  ],

  search: {
    enable: true,
  },

  comment: {
    enable: false // 不使用评论功能
  },

  statistics: {
      enable: true,
      readTime: {
        /**
         * 阅读速度
         */
        speed: {
          cn: 300,
          en: 200,
        },
      },
    },

  sponsor: {
    enable: false,
  },
})