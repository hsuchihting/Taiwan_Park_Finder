import type { ParkRecommendation, ParkSearchResponse } from '~/types/park'
import { parseParkSearchQuery } from '~/utils/parkParser'
import { rankParks } from '~/utils/parkScoring'

export interface ParkSearchProvider {
  search(queryText: string, city?: string): Promise<ParkSearchResponse>
}

const withBase = (path: string) => {
  const base = useRuntimeConfig().app.baseURL || '/'
  return `${base.replace(/\/$/, '')}${path}`
}

let apiUnavailable = false
let snapshotCache: ParkSearchResponse | null = null

// 靜態部署（如 GitHub Pages）沒有伺服器 API，改讀建置時烘焙的 Twinkle Hub 快照
const fetchSnapshot = async (): Promise<ParkSearchResponse> => {
  snapshotCache ||= await $fetch<ParkSearchResponse>(withBase('/data/parks.json'))
  return snapshotCache
}

const twinkleParkSearchProvider: ParkSearchProvider = {
  async search(queryText, city) {
    if (apiUnavailable) return await fetchSnapshot()

    try {
      return await $fetch<ParkSearchResponse>(withBase('/api/parks'), {
        method: 'POST',
        body: { query: queryText, city }
      })
    } catch (error) {
      // 404/405 代表沒有伺服器 API（純靜態主機）；其他錯誤（如 502）則是伺服器暫時查詢失敗
      const statusCode = (error as { statusCode?: number })?.statusCode
      if (statusCode === 404 || statusCode === 405) {
        apiUnavailable = true
        return await fetchSnapshot()
      }
      throw error
    }
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
