import type { ParkSearchResponse } from '~/types/park'
import { taiwanCities } from '~/utils/parkParser'

// Prerendered during `nuxt generate` (see nitro.prerender in nuxt.config.ts) so the
// static GitHub Pages build ships a Twinkle Hub snapshot without exposing the API key.
export default defineEventHandler(async (): Promise<ParkSearchResponse> => {
  const apiKey = useRuntimeConfig().twinkleHubApiKey
  const generatedAt = new Date().toISOString().slice(0, 10)

  if (!apiKey) {
    return {
      parks: [],
      source: 'twinkle-hub',
      message: '建置時未提供 Twinkle Hub API key，靜態資料快照為空。',
      datasets: []
    }
  }

  const client = await createTwinkleClient(apiKey)
  const allParks: ParkSearchResponse['parks'] = []
  const datasetMap = new Map<string, NonNullable<ParkSearchResponse['datasets']>[number]>()
  const failedCities: string[] = []

  for (const city of taiwanCities) {
    try {
      const { parks, datasets } = await fetchTwinkleParks(client, city)
      allParks.push(...parks)
      for (const dataset of datasets) datasetMap.set(dataset.id, dataset)
    } catch (error) {
      failedCities.push(city)
      console.error(`Twinkle Hub snapshot failed for ${city}`, error)
    }
  }

  const parks = dedupeParks(allParks)
  const failNote = failedCities.length ? `（${failedCities.join('、')}本次擷取失敗）` : ''

  return {
    parks,
    source: 'twinkle-hub',
    message: `Twinkle Hub 資料快照，共 ${parks.length} 筆公園，擷取於 ${generatedAt}${failNote}。`,
    datasets: [...datasetMap.values()]
  }
})
