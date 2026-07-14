export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2024-07-01',
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
