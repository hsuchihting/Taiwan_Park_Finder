import { mockParks } from '~/data/mockParks'
import type { ParkRecommendation, ParkSearchResponse } from '~/types/park'
import { parseParkSearchQuery } from '~/utils/parkParser'
import { rankParks } from '~/utils/parkScoring'

export interface ParkSearchProvider {
  search(queryText: string, city?: string): Promise<ParkSearchResponse>
}

const mockParkSearchProvider: ParkSearchProvider = {
  async search() {
    return {
      parks: mockParks,
      source: 'mock',
      message: '尚未設定 Twinkle Hub API key，目前顯示台北市示範資料。'
    }
  }
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
  const source = ref<ParkSearchResponse['source']>('mock')
  const sourceMessage = ref('')
  const datasets = ref<ParkSearchResponse['datasets']>([])

  const search = async (nextQuery = query.value) => {
    query.value = nextQuery
    isLoading.value = true

    try {
      let response: ParkSearchResponse
      try {
        response = await provider.search(nextQuery, selectedCity.value || undefined)
      } catch {
        response = await mockParkSearchProvider.search(nextQuery, selectedCity.value || undefined)
        response.message = 'Twinkle Hub 暫時無法連線，已切換為台北市示範資料。'
      }

      const parsedQuery = parseParkSearchQuery(
        [selectedCity.value, nextQuery].filter(Boolean).join(' ')
      )
      recommendations.value = rankParks(response.parks, parsedQuery)
      source.value = response.source
      sourceMessage.value = response.message || ''
      datasets.value = response.datasets || []
      hasSearched.value = true
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
    datasets,
    search
  }
}
