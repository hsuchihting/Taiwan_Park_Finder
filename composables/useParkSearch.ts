import type { ParkRecommendation, ParkSearchResponse } from '~/types/park'
import { parseParkSearchQuery } from '~/utils/parkParser'
import { rankParks } from '~/utils/parkScoring'

export interface ParkSearchProvider {
  search(queryText: string, city?: string): Promise<ParkSearchResponse>
}

const twinkleParkSearchProvider: ParkSearchProvider = {
  async search(queryText, city) {
    return await $fetch<ParkSearchResponse>('/api/parks', {
      method: 'POST',
      body: { query: queryText, city }
    })
  }
}

export const useParkSearch = (provider: ParkSearchProvider = twinkleParkSearchProvider) => {
  const query = ref('適合小孩、有廁所、捷運可到')
  const recommendations = ref<ParkRecommendation[]>([])
  const hasSearched = ref(false)
  const selectedCity = ref('')
  const isLoading = ref(false)
  const source = ref<ParkSearchResponse['source']>('twinkle-hub')
  const sourceMessage = ref('')
  const searchError = ref('')
  const datasets = ref<ParkSearchResponse['datasets']>([])

  const search = async (nextQuery = query.value) => {
    query.value = nextQuery
    isLoading.value = true
    searchError.value = ''

    try {
      const response = await provider.search(nextQuery, selectedCity.value || undefined)

      const parsedQuery = parseParkSearchQuery(
        [selectedCity.value, nextQuery].filter(Boolean).join(' ')
      )
      recommendations.value = rankParks(response.parks, parsedQuery)
      source.value = response.source
      sourceMessage.value = response.message || ''
      datasets.value = response.datasets || []
      hasSearched.value = true
    } catch {
      searchError.value = 'Twinkle Hub 暫時無法完成查詢，請稍後再試。'
    } finally {
      isLoading.value = false
    }
  }

  onMounted(() => search(query.value))

  return {
    query,
    selectedCity,
    recommendations,
    hasSearched,
    isLoading,
    source,
    sourceMessage,
    searchError,
    datasets,
    search
  }
}
