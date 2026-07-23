import type { FeatureConfidence, Park, ParkFeature, ParkFeatureType, ParkSearchResponse } from '#shared/types/park'
import { featureLabels } from '#shared/utils/parkParser'

export type DatasetHit = {
  dataset_id: string
  title: string
  license?: string
}

export type DatasetDetail = {
  source_url?: string
  license?: string
}

export type TwinkleClient = Awaited<ReturnType<typeof createTwinkleClient>>

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

// 政府資料多用「臺」、前端縣市清單用「台」，比對前先統一
const toTw = (value: string) => value.replace(/臺/g, '台')

const cityPattern = /(基隆市|台北市|新北市|桃園市|新竹[市縣]|苗栗縣|台中市|彰化縣|南投縣|雲林縣|嘉義[市縣]|台南市|高雄市|屏東縣|宜蘭縣|花蓮縣|台東縣|澎湖縣|金門縣|連江縣)/

// 只保留地方公園／綠地設施類資料集；排除國家公園與研究計畫、報告、認養清冊等文件型資料集
const isLocalParkDataset = (title: string) =>
  /公園|綠地|兒童遊戲場/.test(title) &&
  !/國家公園|國家自然公園|地質公園|計畫|報告|研究|調查|監測|認養|稽查|工程|願景|彙整|文稿/.test(title)

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
  // 排除文件型資料列（如研究計畫 PDF 附件清單）
  if (/\.(pdf|docx?|xlsx?|odt|ods)$/i.test(name) || /計畫|報告書|研究案/.test(name)) return null

  const normalizedAddress = toTw(address)
  const cityFromAddress = normalizedAddress.match(cityPattern)?.[1]
  const cityFromTitle = toTw(dataset.title).match(cityPattern)?.[1]
  // 先移除縣市名稱，否則「台北市士林區」會先被解析成行政區「台北市」。
  const addressWithoutCity = cityFromAddress ? normalizedAddress.replace(cityFromAddress, ' ') : normalizedAddress
  const districtFromAddress = addressWithoutCity.match(/([一-鿿]{1,4}(?:區|鄉|鎮|市))/)?.[1]
  const features: ParkFeature[] = featureRules
    .filter(([, pattern]) => pattern.test(fullText))
    .map(([type]) => ({ type, label: featureLabels[type], confidence: 'official' as FeatureConfidence }))

  return {
    id: `${dataset.dataset_id}-${index}-${name}`,
    name,
    // 欄位名模糊比對可能誤中無關欄位（如編號），值須像縣市名才採用；再依序用地址、資料集標題推斷
    city: (/[市縣]$/.test(getValue(row, aliases.city)) ? toTw(getValue(row, aliases.city)) : '') || cityFromAddress || cityFromTitle || requestedCity || '未標示縣市',
    district: (/[區鄉鎮市]$/.test(getValue(row, aliases.district)) ? getValue(row, aliases.district) : '') || districtFromAddress || '未標示行政區',
    address: address || undefined,
    latitude: Number(getValue(row, aliases.latitude)) || undefined,
    longitude: Number(getValue(row, aliases.longitude)) || undefined,
    sourceDatasetId: dataset.dataset_id,
    locationStatus: address ? 'original' : 'unresolved',
    locationSource: address ? 'twinkle-hub' : undefined,
    description: getValue(row, aliases.description) || undefined,
    features,
    sourceName: dataset.title,
    sourceUrl: detail.source_url,
    lastVerifiedAt: new Date().toISOString().slice(0, 10)
  }
}

export const dedupeParks = (parks: Park[]): Park[] =>
  parks.filter((park, index, all) =>
    all.findIndex((candidate) => candidate.name === park.name && candidate.address === park.address) === index
  )

export const fetchTwinkleParks = async (
  client: TwinkleClient,
  city?: string
): Promise<{ parks: Park[]; datasets: NonNullable<ParkSearchResponse['datasets']> }> => {
  // 「公園」單獨查詢會被國家公園研究文獻洗版；帶縣市或改用設施類詞彙才能命中地方公園資料集
  // 政府資料集標題慣用「臺」，查詢詞先轉換才搜得到（如「台北市」→「臺北市」）
  const twCity = city?.replace(/台/g, '臺')
  const queries = twCity ? [`${twCity}公園`, `${twCity}公園綠地`] : ['公園綠地', '公園設施', '兒童遊戲場']
  const searchResponses = await Promise.all(
    queries.map((query) => client.callTool<unknown>('search_datasets', { query, limit: 6 }))
  )
  const datasetMap = new Map<string, DatasetHit>()
  for (const response of searchResponses) {
    for (const value of extractArray<unknown>(response, ['hits', 'datasets', 'results', 'items', 'data'])) {
      const dataset = normalizeDataset(value)
      if (dataset && isLocalParkDataset(dataset.title)) datasetMap.set(dataset.dataset_id, dataset)
    }
  }
  // 指定縣市時優先採用標題含該縣市的資料集，避免語意搜尋混入其他縣市
  const allDatasets = [...datasetMap.values()]
  const cityDatasets = city ? allDatasets.filter((dataset) => toTw(dataset.title).includes(toTw(city))) : []
  const datasets = cityDatasets.length ? cityDatasets : allDatasets

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

  const parks = dedupeParks(
    results
      .flatMap(({ dataset, detail, rows }) => rows.map((row, index) => normalizeRow(row, dataset, detail, index, city)))
      .filter((park): park is Park => Boolean(park))
      .filter((park) => !city || toTw(park.city).includes(toTw(city)) || toTw(park.address || '').includes(toTw(city)))
  )

  return {
    parks,
    datasets: results.map(({ dataset, detail }) => ({
      id: dataset.dataset_id,
      title: dataset.title,
      sourceUrl: detail.source_url,
      license: dataset.license || detail.license
    }))
  }
}
