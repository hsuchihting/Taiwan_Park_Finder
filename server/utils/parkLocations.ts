import type { H3Event } from 'h3'
import type { Park } from '~/types/park'

type D1DatabaseLike = {
  prepare(query: string): {
    bind(...values: unknown[]): {
      first<T>(): Promise<T | null>
      run(): Promise<unknown>
    }
  }
}

type LocationRow = {
  address: string | null
  latitude: number | null
  longitude: number | null
  source_url: string | null
  status: 'enriched' | 'unresolved'
}

type GeocodeResult = {
  address?: string
  latitude?: number
  longitude?: number
  sourceUrl?: string
}

const getDb = (event: H3Event): D1DatabaseLike | undefined => {
  const context = event.context as { cloudflare?: { env?: { DB?: D1DatabaseLike } } }
  return context.cloudflare?.env?.DB
}

const normalize = (value: string) => value.replace(/[臺台]/g, '台').replace(/\s+/g, '').toLowerCase()

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
let nextGeocodeAt = 0

const throttleGeocoder = async () => {
  const now = Date.now()
  const delay = Math.max(0, nextGeocodeAt - now)
  nextGeocodeAt = Math.max(now, nextGeocodeAt) + 1100
  if (delay) await wait(delay)
}

const geocode = async (park: Park): Promise<GeocodeResult | null> => {
  const config = useRuntimeConfig()
  const baseUrl = config.geocoderBaseUrl || 'https://nominatim.openstreetmap.org'
  const hasCoordinates = Number.isFinite(park.latitude) && Number.isFinite(park.longitude)
  const url = new URL(hasCoordinates ? '/reverse' : '/search', baseUrl)
  url.search = hasCoordinates
    ? new URLSearchParams({ lat: String(park.latitude), lon: String(park.longitude), format: 'jsonv2', addressdetails: '1' }).toString()
    : new URLSearchParams({ q: [park.name, park.city, park.district, '台灣'].filter(Boolean).join(', '), format: 'jsonv2', addressdetails: '1', limit: '5', countrycodes: 'tw' }).toString()
  await throttleGeocoder()
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': config.geocoderUserAgent || 'TaiwanParkFinder/1.0 (park location lookup)'
    }
  })
  if (!response.ok) return null
  const payload = await response.json() as { display_name?: string; lat?: string; lon?: string; osm_type?: string; osm_id?: number } | Array<{ display_name?: string; lat?: string; lon?: string; osm_type?: string; osm_id?: number }>
  const rows = Array.isArray(payload) ? payload : [payload]
  const parkName = normalize(park.name)
  const city = normalize(park.city)
  const match = hasCoordinates ? rows[0] : rows.find((row) => {
    const text = normalize(row.display_name || '')
    return text.includes(parkName) && (!city || text.includes(city))
  })
  if (!match) return null
  const latitude = Number(match.lat)
  const longitude = Number(match.lon)
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null
  return {
    address: match.display_name,
    latitude,
    longitude,
    sourceUrl: match.osm_type && match.osm_id ? `https://www.openstreetmap.org/${match.osm_type}/${match.osm_id}` : undefined
  }
}

const keyParts = (park: Park) => [park.sourceDatasetId || '', normalize(park.name), normalize(park.city), normalize(park.district)]

const applyRow = (park: Park, row: LocationRow): Park => ({
  ...park,
  address: row.address || undefined,
  latitude: row.latitude ?? undefined,
  longitude: row.longitude ?? undefined,
  locationStatus: row.status,
  locationSource: row.status === 'enriched' ? 'openstreetmap' : undefined,
  locationSourceUrl: row.source_url || undefined
})

export const enrichMissingParkLocations = async (event: H3Event, parks: Park[]): Promise<Park[]> => {
  const db = getDb(event)
  if (!db) return parks
  const result: Park[] = []
  let missesProcessed = 0

  for (const park of parks) {
    if (park.address) {
      result.push(park)
      continue
    }
    const [datasetId, name, city, district] = keyParts(park)
    const cached = await db.prepare(
      'SELECT address, latitude, longitude, source_url, status FROM park_location_enrichments WHERE dataset_id = ? AND park_name = ? AND city = ? AND district = ? LIMIT 1'
    ).bind(datasetId, name, city, district).first<LocationRow>()
    if (cached) {
      result.push(applyRow(park, cached))
      continue
    }
    if (missesProcessed >= 3) {
      result.push({ ...park, locationStatus: 'unresolved' })
      continue
    }
    missesProcessed += 1
    try {
      const match = await geocode(park)
      if (match) {
        await db.prepare(
          'INSERT OR REPLACE INTO park_location_enrichments (dataset_id, park_name, city, district, address, latitude, longitude, source_url, status, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)'
        ).bind(datasetId, name, city, district, match.address || null, match.latitude ?? null, match.longitude ?? null, match.sourceUrl || null, 'enriched').run()
        result.push({ ...park, ...match, locationStatus: 'enriched', locationSource: 'openstreetmap', locationSourceUrl: match.sourceUrl })
      } else {
        await db.prepare(
          'INSERT OR REPLACE INTO park_location_enrichments (dataset_id, park_name, city, district, status, updated_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)'
        ).bind(datasetId, name, city, district, 'unresolved').run()
        result.push({ ...park, locationStatus: 'unresolved' })
      }
    } catch {
      result.push({ ...park, locationStatus: 'unresolved' })
    }
  }
  return result
}
