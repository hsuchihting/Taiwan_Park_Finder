export default defineNuxtConfig({
  ssr: false,
  // 2024-09-19 之後 Nitro 的 cloudflare_module preset 才會使用 Workers Static Assets（非 legacy Workers Sites）
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
    // Cloudflare Workers Builds（WORKERS_CI=1）需要 module worker 輸出；其他環境維持自動偵測
    preset: process.env.WORKERS_CI ? 'cloudflare_module' : undefined,
    prerender: {
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
