import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  content: [
    './components/**/*.{vue,js,ts}',
    './composables/**/*.{js,ts}',
    './pages/**/*.vue',
    './app.vue'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Noto Sans TC', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      colors: {
        park: {
          leaf: '#1F7A4D',
          moss: '#566B35',
          sky: '#D8EEF5',
          sun: '#F6C453',
          clay: '#C56A3A'
        }
      }
    }
  }
}
