export default defineNuxtConfig({
  ssr: false,
  // Cloudflare Workers Builds 會注入 WORKERS_CI；本機維持 Node preset 方便 preview。
  compatibilityDate: '2026-07-01',
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  devtools: { enabled: true },
  typescript: {
    strict: true,
    typeCheck: true
  },
  runtimeConfig: {
    twinkleHubApiKey: ''
  },
  nitro: {
    // Workers Static Assets 的官方 Nitro preset。
    preset: process.env.WORKERS_CI ? 'cloudflare' : undefined,
    // 本地驗證可用 SKIP_PRERENDER=1 避免依賴外部資料服務；CI/正式環境仍會產生靜態資料。
    prerender: process.env.SKIP_PRERENDER === '1'
      ? undefined
      : {
          routes: ['/data/parks.json']
        }
  },
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/',
    head: {
      title: 'Taiwan Park Finder',
      meta: [
        {
          name: 'description',
          content: '串接 Twinkle Hub 台灣開放資料，用自然語言探索全台親子、寵物、無障礙與交通友善公園'
        }
      ]
    }
  }
})
