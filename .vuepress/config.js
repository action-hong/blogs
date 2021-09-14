module.exports = {
  title: "原来你是阿旋呀",
  description: "个人生活，工作随便扯扯",
  dest: "public",
  head: [
    [
      "link",
      {
        rel: "icon",
        href: "/favicon.ico",
      },
    ],
    [
      "meta",
      {
        name: "viewport",
        content: "width=device-width,initial-scale=1,user-scalable=no",
      },
    ]
  ],
  theme: "reco",
  themeConfig: {
    nav: [
      {
        text: "首页",
        link: "/",
        icon: "reco-home",
      },
      {
        text: "时间轴",
        link: "/timeline/",
        icon: "reco-date",
      },
      {
        text: "联系",
        icon: "reco-message",
        items: [
          {
            text: "GitHub",
            link: "https://github.com/action-hong",
            icon: "reco-github",
          }
        ],
      },
    ],
    // sidebar: {
    //   "/docs/theme-reco/": ["", "theme", "plugin", "api"],
    // },
    type: "blog",
    blogConfig: {
      category: {
        location: 2,
        text: "分类",
      },
      tag: {
        location: 3,
        text: "标签",
      },
    },
    friendLink: [
      {
        title: "午后南杂",
        desc: "Enjoy when you can, and endure when you must.",
        email: "1156743527@qq.com",
        link: "https://www.recoluan.com",
      },
      {
        title: "vuepress-theme-reco",
        desc: "A simple and beautiful vuepress Blog & Doc theme.",
        avatar:
          "https://vuepress-theme-reco.recoluan.com/icon_vuepress_reco.png",
        link: "https://vuepress-theme-reco.recoluan.com",
      },
    ],
    logo: "/logo.png",
    search: true,
    searchMaxSuggestions: 10,
    lastUpdated: "Last Updated",
    author: "kkopite",
    authorAvatar: "/avatar.png",
    record: "闽ICP备2021006036号-1",
    recordLink: "https://beian.miit.gov.cn/",
    startYear: "2021",
    valineConfig: {
      appId: 'xBAEfuaC1jwjNYyEizNKTp1Y-gzGzoHsz',
      appKey: 'm4GussuOBthGeh6G03S8RKXR'
    }
  },
  markdown: {
    lineNumbers: true,
  },
  plugins: [
    [
      "permalink-pinyin",
      {
        lowercase: true, // Converted into lowercase, default: true
        separator: "-", // Separator of the slug, default: '-'
      }
    ],
    [
      'demo-code', 
      {
        onlineBtns: {
          codepen: true,
          jsfiddle: true,
          codesandbox: true,
      },
      }
    ],
    // 离谱，文档写着会自动注册，但还是要自己加才行？
    [
      '@vuepress/register-components',
      {
        componentsDir: '/.vuepress/components'
      }
    ]
  ]
};
