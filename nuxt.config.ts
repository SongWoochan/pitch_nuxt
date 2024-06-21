// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  app: {
    head: {
      title: '다정농원 대극천 복숭아',
      link: [{ rel: 'icon', type: 'image/png', href: "/img/icons8-peach-32.png" }],
      meta: [
        { property:'og:image', content: 'https://dajung-peach.pages.dev/img/pitch_1.jpg'},
      ],
      script : [
        // 다음 주소 검색 API
        { src: '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js' },
      ],
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
    notionToken: 'secret_1PBR9ciZwc4smO4MpCJrmp8T0J8VOVRKqV47RbwKxyv',
    notionDatabasePitch: '5bb8e896de6a48e2b3d5542b4ee988da',
  }
})
