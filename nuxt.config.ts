// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  app: {
    head: {
      title: '다정농원 대극천 복숭아',
      link: [{ rel: 'icon', type: 'image/png', href: "/img/icons8-peach-32.png" }],
      // script : [
      //   // 다음 주소 검색 API
      //   { src: '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js' },
      // ],
    },
  },
  devtools: { enabled: true },
  build: {
    transpile: ['vuetify'],
  },
  modules: [
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }))
      })
    },
    //...
  ],
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },
  runtimeConfig: {
    PROFILE: process.env.PROFILE,
    ADMIN_PWD: process.env.ADMIN_PWD,
    NOTION_TOKEN: process.env.NOTION_TOKEN,
    NOTION_DATABASE_PITCH: process.env.NOTION_DATABASE_PITCH,
    NOTION_DATABASE_PRICE: process.env.NOTION_DATABASE_PRICE,
    public: {
      PRICE_3KG: process.env.PRICE_3KG ?? '0',
      PRICE_2KG: process.env.PRICE_2KG ?? '0',
      DOMAIN: process.env.DOMAIN ?? ''
    }
  }
})
