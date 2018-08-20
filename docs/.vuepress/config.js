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
          { text: 'User Guide', link: '/guide/' }
        ],

        sidebar: {
          '/guide/': [
            '',
            'installation',
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
          { text: 'ユーザーガイド', link: '/ja/guide/' }
        ],

        sidebar: {
          '/ja/guide/': [
            '',
            'installation',
            'command',
            'config',
            'task'
          ]
        }
      }
    }
  }
}
