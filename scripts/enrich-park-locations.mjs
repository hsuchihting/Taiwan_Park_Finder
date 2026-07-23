const baseUrl = process.env.PARK_APP_URL || 'http://127.0.0.1:3000'
const rounds = Number(process.env.PARK_ENRICH_ROUNDS || 8)
const cities = [
  '基隆市', '台北市', '新北市', '桃園市', '新竹市', '新竹縣', '苗栗縣', '台中市',
  '彰化縣', '南投縣', '雲林縣', '嘉義市', '嘉義縣', '台南市', '高雄市', '屏東縣',
  '宜蘭縣', '花蓮縣', '台東縣', '澎湖縣', '金門縣', '連江縣'
]

for (let round = 1; round <= rounds; round += 1) {
  let total = 0
  for (const city of cities) {
    const response = await fetch(`${baseUrl}/api/parks`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: '公園', city })
    })
    if (!response.ok) throw new Error(`${city}: ${response.status}`)
    const data = await response.json()
    total += data.parks?.filter((park) => park.locationStatus === 'enriched').length || 0
  }
  console.log(`enrichment round ${round}: ${total} enriched parks returned`)
  if (!total) break
}
