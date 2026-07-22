import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  content: [
    './app/**/*.{vue,js,ts}',
    './shared/**/*.{js,ts}',
    './server/**/*.{js,ts}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Noto Sans TC', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      colors: {
        park: {
          leaf: '#25A95B',
          moss: '#367A52',
          sky: '#BEEBFF',
          sun: '#FFD95A',
          clay: '#FF7868',
          lilac: '#B99BFF'
        }
      }
    }
  }
}
