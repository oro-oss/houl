module.exports = {
  locales: {
    '/': {
      lang: 'en-US',
      title: 'Houl',
      description: 'Full-contained static site workflow',
    },

    '/ja/': {
      lang: 'ja-JP',
      title: 'Houl',
      description: '全部入りの静的サイトワークフロー',
    }
  },

  themeConfig: {
    locales: {
      '/': {
        selectText: 'Languages',
        label: 'English',

        nav: [
          { text: 'User Guide', link: '/guide/' },
          { text: 'GitHub', link: 'https://github.com/oro-oss/houl' }
        ],

        sidebar: {
          '/guide/': [
            '',
            'command',
            'config',
            'task'
          ]
        }
      },

      '/ja/': {
        selectText: '言語',
        label: '日本語',

        nav: [
          { text: 'ユーザーガイド', link: '/ja/guide/' },
          { text: 'GitHub', link: 'https://github.com/oro-oss/houl' }
        ],

        sidebar: {
          '/ja/guide/': [
            '',
            'command',
            'config',
            'task'
          ]
        }
      }
    }
  }
}
