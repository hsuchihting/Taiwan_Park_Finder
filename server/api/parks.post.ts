import { createError, readBody } from 'h3'
import { mockParks } from '~/data/mockParks'
import type { FeatureConfidence, Park, ParkFeature, ParkFeatureType, ParkSearchResponse } from '~/types/park'
import { featureLabels } from '~/utils/parkParser'

type DatasetHit = {
  dataset_id: string
  title: string
  license?: string
}

type DatasetDetail = {
  source_url?: string
  license?: string
}

const extractArray = <T>(value: unknown, keys: string[]): T[] => {
  if (Array.isArray(value)) return value as T[]
  if (!value || typeof value !== 'object') return []

  const record = value as Record<string, unknown>
  for (const key of keys) {
    if (Array.isArray(record[key])) return record[key] as T[]
  }
  return []
}

const extractDetail = (value: unknown): DatasetDetail => {
  if (!value || typeof value !== 'object') return {}
  const record = value as Record<string, unknown>
  const nested = record.dataset || record.data || record.result
  return (nested && typeof nested === 'object' ? nested : record) as DatasetDetail
}

const extractRows = (value: unknown): Record<string, unknown>[] => {
  if (Array.isArray(value)) {
    return value.filter((row): row is Record<string, unknown> => Boolean(row) && !Array.isArray(row) && typeof row === 'object')
  }
  if (!value || typeof value !== 'object') return []

  const record = value as Record<string, unknown>
  const rows = extractArray<unknown>(record, ['rows', 'results', 'items', 'data'])
  const columns = Array.isArray(record.columns) ? record.columns.map(String) : []

  return rows.flatMap((row) => {
    if (Array.isArray(row) && columns.length) {
      return [Object.fromEntries(columns.map((column, index) => [column, row[index]]))]
    }
    return row && typeof row === 'object' ? [row as Record<string, unknown>] : []
  })
}

const normalizeDataset = (value: unknown): DatasetHit | null => {
  if (!value || typeof value !== 'object') return null
  const record = value as Record<string, unknown>
  const datasetId = String(record.dataset_id || record.id || record.datasetId || '')
  if (!datasetId) return null
  return {
    dataset_id: datasetId,
    title: String(record.title || record.name || datasetId),
    license: record.license ? String(record.license) : undefined
  }
}

const aliases = {
  name: ['公園名稱', '名稱', 'name', '景點名稱', '設施名稱', '據點名稱'],
  city: ['縣市', '縣市別', '城市', 'city', '地址縣市'],
  district: ['行政區', '鄉鎮市區', '區域', 'district'],
  address: ['地址', '所在地', 'location', 'address', '地點'],
  latitude: ['緯度', 'latitude', 'lat', 'y', 'wgs84lat'],
  longitude: ['經度', 'longitude', 'lng', 'lon', 'x', 'wgs84lon'],
  description: ['簡介', '說明', '介紹', 'description', '備註']
} as const

const getValue = (row: Record<string, unknown>, names: readonly string[]) => {
  const key = Object.keys(row).find((candidate) =>
    names.some((name) => candidate.toLowerCase().replace(/[_\s-]/g, '').includes(name.toLowerCase().replace(/[_\s-]/g, '')))
  )
  const value = key ? row[key] : undefined
  return value === undefined || value === null ? '' : String(value).trim()
}

const featureRules: Array<[ParkFeatureType, RegExp]> = [
  ['toilet', /廁所|化妝室|洗手間/],
  ['playground', /遊戲場|遊具|溜滑梯|兒童/],
  ['accessible', /無障礙|輪椅|通用設計/],
  ['pet_friendly', /寵物|犬|狗/],
  ['mrt_nearby', /捷運/],
  ['ubike', /youbike|ubike|公共自行車/i],
  ['parking', /停車/],
  ['shade', /遮蔭|樹蔭|林蔭/],
  ['basketball', /籃球/],
  ['picnic', /野餐|草坪|草地/],
  ['trail', /步道|步行|健走/]
]

const normalizeRow = (
  row: Record<string, unknown>,
  dataset: DatasetHit,
  detail: DatasetDetail,
  index: number,
  requestedCity?: string
): Park | null => {
  const name = getValue(row, aliases.name)
  const address = getValue(row, aliases.address)
  const fullText = Object.values(row).filter(Boolean).join(' ')
  if (!name || (!/公園|綠地|遊憩|森林|園區/.test(`${name} ${fullText}`))) return null

  const cityFromAddress = address.match(/(基隆市|台北市|新北市|桃園市|新竹[市縣]|苗栗縣|台中市|彰化縣|南投縣|雲林縣|嘉義[市縣]|台南市|高雄市|屏東縣|宜蘭縣|花蓮縣|台東縣|澎湖縣|金門縣|連江縣)/)?.[1]
  const districtFromAddress = address.match(/([\u4e00-\u9fff]{2,4}(?:區|鄉|鎮|市))/)?.[1]
  const features: ParkFeature[] = featureRules
    .filter(([, pattern]) => pattern.test(fullText))
    .map(([type]) => ({ type, label: featureLabels[type], confidence: 'official' as FeatureConfidence }))

  return {
    id: `${dataset.dataset_id}-${index}-${name}`,
    name,
    city: getValue(row, aliases.city) || cityFromAddress || requestedCity || '未標示縣市',
    district: getValue(row, aliases.district) || districtFromAddress || '未標示行政區',
    address: address || '原始資料未提供地址',
    latitude: Number(getValue(row, aliases.latitude)) || undefined,
    longitude: Number(getValue(row, aliases.longitude)) || undefined,
    description: getValue(row, aliases.description) || undefined,
    features,
    sourceName: dataset.title,
    sourceUrl: detail.source_url,
    lastVerifiedAt: new Date().toISOString().slice(0, 10)
  }
}

export default defineEventHandler(async (event): Promise<ParkSearchResponse> => {
  const body = await readBody<{ query?: string; city?: string }>(event)
  const query = String(body?.query || '').slice(0, 200)
  const city = String(body?.city || '').slice(0, 20)
  const apiKey = useRuntimeConfig(event).twinkleHubApiKey

  if (!apiKey) {
    return {
      parks: mockParks,
      source: 'mock',
      message: '尚未設定 Twinkle Hub API key，目前顯示台北市示範資料。'
    }
  }

  try {
    const client = await createTwinkleClient(apiKey)
    const datasetResponse = await client.callTool<unknown>('search_datasets', {
      query: city ? `${city}公園` : '公園',
      limit: 6
    })
    const datasets = extractArray<unknown>(datasetResponse, ['hits', 'datasets', 'results', 'items', 'data'])
      .map(normalizeDataset)
      .filter((dataset): dataset is DatasetHit => Boolean(dataset))

    const results = await Promise.all(datasets.slice(0, 6).map(async (dataset) => {
      const [detailResponse, rowsResponse] = await Promise.all([
        client.callTool<unknown>('get_dataset', { dataset_id: dataset.dataset_id }),
        client.callTool<unknown>('query_rows', {
          dataset_id: dataset.dataset_id,
          limit: 100
        })
      ])
      const detail = extractDetail(detailResponse)
      const rows = extractRows(rowsResponse)
      return { dataset, detail, rows }
    }))

    const parks = results
      .flatMap(({ dataset, detail, rows }) => rows.map((row, index) => normalizeRow(row, dataset, detail, index, city)))
      .filter((park): park is Park => Boolean(park))
      .filter((park) => !city || park.city.includes(city) || park.address.includes(city))
      .filter((park, index, all) => all.findIndex((candidate) => candidate.name === park.name && candidate.address === park.address) === index)

    return {
      parks,
      source: 'twinkle-hub',
      message: parks.length ? `已從 Twinkle Hub 取得 ${parks.length} 筆公園資料。` : 'Twinkle Hub 已連線，但本次查詢沒有找到可辨識的公園資料。',
      datasets: results.map(({ dataset, detail }) => ({
        id: dataset.dataset_id,
        title: dataset.title,
        sourceUrl: detail.source_url,
        license: dataset.license || detail.license
      }))
    }
  } catch (error) {
    console.error('Twinkle Hub park search failed', error)
    throw createError({ statusCode: 502, message: 'Twinkle Hub 暫時無法完成查詢' })
  }
})
