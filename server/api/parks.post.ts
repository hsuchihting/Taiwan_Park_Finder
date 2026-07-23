import { createError, readBody } from 'h3'
import type { ParkSearchResponse } from '#shared/types/park'

export default defineEventHandler(async (event): Promise<ParkSearchResponse> => {
  const body = await readBody<{ query?: string; city?: string }>(event)
  const city = String(body?.city || '').slice(0, 20)
  const apiKey = useRuntimeConfig(event).twinkleHubApiKey

  if (!apiKey) {
    throw createError({ statusCode: 500, message: '尚未設定 Twinkle Hub API key' })
  }

  try {
    const client = await createTwinkleClient(apiKey)
    const { parks: rawParks, datasets } = await fetchTwinkleParks(client, city || undefined)
    const parks = await enrichMissingParkLocations(event, rawParks)

    return {
      parks,
      source: 'twinkle-hub',
      message: parks.length ? `已從 Twinkle Hub 取得 ${parks.length} 筆公園資料。` : 'Twinkle Hub 已連線，但本次查詢沒有找到可辨識的公園資料。',
      datasets
    }
  } catch (error) {
    console.error('Twinkle Hub park search failed', error)
    throw createError({ statusCode: 502, message: 'Twinkle Hub 暫時無法完成查詢' })
  }
})
