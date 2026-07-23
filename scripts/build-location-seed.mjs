import { readFile, writeFile } from 'node:fs/promises'

const [, , snapshotPath = '.output/public/data/parks.json', outputPath = 'park-locations-seed.sql', cachePath = `${outputPath}.cache.json`] = process.argv
const snapshot = JSON.parse(await readFile(snapshotPath, 'utf8'))
const missing = snapshot.parks.filter((park) => !park.address)
let cache = {}

try {
  cache = JSON.parse(await readFile(cachePath, 'utf8'))
} catch {
  cache = {}
}

const normalize = (value = '') => value.replace(/[臺台]/g, '台').replace(/\s+/g, '').toLowerCase()
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const escapeSql = (value) => value == null ? 'NULL' : `'${String(value).replaceAll("'", "''")}'`
const numberSql = (value) => Number.isFinite(Number(value)) ? String(Number(value)) : 'NULL'

const geocode = async (park) => {
  const hasCoordinates = Number.isFinite(Number(park.latitude)) && Number.isFinite(Number(park.longitude))
  const url = new URL(hasCoordinates ? '/reverse' : '/search', 'https://nominatim.openstreetmap.org')
  url.search = hasCoordinates
    ? new URLSearchParams({ lat: String(park.latitude), lon: String(park.longitude), format: 'jsonv2', addressdetails: '1' }).toString()
    : new URLSearchParams({
        q: [park.name, park.city, park.district, '台灣'].filter(Boolean).join(', '),
        format: 'jsonv2',
        addressdetails: '1',
        limit: '5',
        countrycodes: 'tw'
      }).toString()

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'TaiwanParkFinder/1.0 (https://taiwanparkfinder.hsuchihting.workers.dev/)'
    }
  })
  if (!response.ok) throw new Error(`Nominatim ${response.status}`)
  const payload = await response.json()
  const rows = Array.isArray(payload) ? payload : [payload]
  const parkName = normalize(park.name)
  const city = normalize(park.city)
  const match = hasCoordinates
    ? rows[0]
    : rows.find((row) => {
        const text = normalize(row.display_name)
        return text.includes(parkName) && (!city || text.includes(city))
      })

  if (!match || !Number.isFinite(Number(match.lat)) || !Number.isFinite(Number(match.lon))) {
    return { status: 'unresolved' }
  }

  return {
    address: match.display_name,
    latitude: Number(match.lat),
    longitude: Number(match.lon),
    sourceUrl: match.osm_type && match.osm_id
      ? `https://www.openstreetmap.org/${match.osm_type}/${match.osm_id}`
      : null,
    status: 'enriched'
  }
}

for (let index = 0; index < missing.length; index += 1) {
  const park = missing[index]
  const key = [park.sourceDatasetId || '', normalize(park.name), normalize(park.city), normalize(park.district)].join('|')
  if (!cache[key]) {
    if (Object.keys(cache).length) await sleep(1100)
    try {
      cache[key] = await geocode(park)
    } catch (error) {
      console.error(`geocode failed for ${park.name}: ${error.message}`)
      await writeFile(cachePath, JSON.stringify(cache, null, 2))
      process.exit(1)
    }
    await writeFile(cachePath, JSON.stringify(cache, null, 2))
  }
  if ((index + 1) % 10 === 0 || index + 1 === missing.length) {
    console.log(`geocoded ${index + 1}/${missing.length}`)
  }
}

const values = missing.map((park) => {
  const datasetId = park.sourceDatasetId || ''
  const name = normalize(park.name)
  const city = normalize(park.city)
  const district = normalize(park.district)
  const result = cache[[datasetId, name, city, district].join('|')] || { status: 'unresolved' }
  return `(${escapeSql(datasetId)}, ${escapeSql(name)}, ${escapeSql(city)}, ${escapeSql(district)}, ${escapeSql(result.address)}, ${numberSql(result.latitude)}, ${numberSql(result.longitude)}, ${escapeSql(result.sourceUrl)}, ${escapeSql(result.status)}, CURRENT_TIMESTAMP)`
})

const sql = [
  'INSERT OR REPLACE INTO park_location_enrichments',
  '(dataset_id, park_name, city, district, address, latitude, longitude, source_url, status, updated_at)',
  'VALUES',
  `${values.join(',\n')};`,
  ''
].join('\n')

await writeFile(outputPath, sql)
console.log(`wrote ${values.length} rows to ${outputPath}`)
