import type { ParkFeatureType, ParkSearchQuery } from '~/types/park'

type FeatureRule = {
  feature: ParkFeatureType
  mustHaveKeywords: string[]
  niceToHaveKeywords: string[]
  intentKeywords: string[]
}

const featureRules: FeatureRule[] = [
  {
    feature: 'toilet',
    mustHaveKeywords: ['廁所', '洗手間', '親子廁所', '化妝室'],
    niceToHaveKeywords: [],
    intentKeywords: ['換尿布', '嬰兒']
  },
  {
    feature: 'playground',
    mustHaveKeywords: ['遊樂場', '遊具', '溜滑梯'],
    niceToHaveKeywords: ['親子', '小孩', '兒童', '孩子'],
    intentKeywords: ['適合小孩', '親子活動', '放電']
  },
  {
    feature: 'accessible',
    mustHaveKeywords: ['無障礙', '輪椅', '嬰兒車'],
    niceToHaveKeywords: ['推車', '長輩'],
    intentKeywords: ['行動不便', '平坦']
  },
  {
    feature: 'pet_friendly',
    mustHaveKeywords: ['寵物友善', '可帶狗', '狗狗'],
    niceToHaveKeywords: ['寵物', '毛孩'],
    intentKeywords: ['遛狗', '散步']
  },
  {
    feature: 'mrt_nearby',
    mustHaveKeywords: ['捷運可到', '捷運附近', '靠近捷運'],
    niceToHaveKeywords: ['捷運', '大眾運輸', '交通方便'],
    intentKeywords: ['不用開車']
  },
  {
    feature: 'ubike',
    mustHaveKeywords: ['YouBike', 'Ubike', 'ubike', '公共自行車'],
    niceToHaveKeywords: ['自行車', '單車'],
    intentKeywords: ['騎車']
  },
  {
    feature: 'parking',
    mustHaveKeywords: ['停車', '停車場'],
    niceToHaveKeywords: ['開車'],
    intentKeywords: ['好停車']
  },
  {
    feature: 'shade',
    mustHaveKeywords: ['遮蔭', '樹蔭', '陰涼'],
    niceToHaveKeywords: ['不曬', '涼快'],
    intentKeywords: ['夏天', '避暑']
  },
  {
    feature: 'basketball',
    mustHaveKeywords: ['籃球', '籃球場'],
    niceToHaveKeywords: ['運動'],
    intentKeywords: ['打球']
  },
  {
    feature: 'picnic',
    mustHaveKeywords: ['野餐'],
    niceToHaveKeywords: ['草地', '坐著休息'],
    intentKeywords: ['聚會']
  },
  {
    feature: 'trail',
    mustHaveKeywords: ['步道', '散步路線'],
    niceToHaveKeywords: ['散步', '健走'],
    intentKeywords: ['走路', '自然']
  }
]

const unique = <T>(values: T[]) => [...new Set(values)]

const includesAny = (query: string, keywords: string[]) =>
  keywords.some((keyword) => query.toLowerCase().includes(keyword.toLowerCase()))

export const taiwanCities = [
  '基隆市', '台北市', '新北市', '桃園市', '新竹市', '新竹縣', '苗栗縣',
  '台中市', '彰化縣', '南投縣', '雲林縣', '嘉義市', '嘉義縣', '台南市',
  '高雄市', '屏東縣', '宜蘭縣', '花蓮縣', '台東縣', '澎湖縣', '金門縣', '連江縣'
] as const

export const parseParkSearchQuery = (raw: string): ParkSearchQuery => {
  const normalizedRaw = raw.trim()
  const normalizedLocationRaw = normalizedRaw.replace(/臺/g, '台')
  const mustHave = featureRules
    .filter((rule) => includesAny(normalizedRaw, rule.mustHaveKeywords))
    .map((rule) => rule.feature)
  const niceToHave = featureRules
    .filter((rule) => includesAny(normalizedRaw, rule.niceToHaveKeywords))
    .map((rule) => rule.feature)
  const intents = featureRules
    .filter((rule) => includesAny(normalizedRaw, rule.intentKeywords))
    .map((rule) => rule.feature)
  const requestedFeatures = unique([...mustHave, ...niceToHave, ...intents])
  const city = taiwanCities.find((candidate) => normalizedLocationRaw.includes(candidate))
  // 縣市名稱也以「市」結尾，須先移除，避免把「台北市」誤判為行政區。
  const districtText = city ? normalizedLocationRaw.replace(city, ' ') : normalizedLocationRaw
  const districtMatch = districtText.match(/([\u4e00-\u9fff]{1,4}(?:區|鄉|鎮|市))/)

  return {
    rawText: normalizedRaw,
    location: city,
    city,
    district: districtMatch?.[1],
    intent: inferIntent(normalizedRaw, requestedFeatures),
    mustHave: unique(mustHave),
    niceToHave: unique(niceToHave)
  }
}

const inferIntent = (
  query: string,
  requestedFeatures: ParkFeatureType[]
): ParkSearchQuery['intent'] => {
  if (includesAny(query, ['親子', '小孩', '兒童', '孩子', '嬰兒']) || requestedFeatures.includes('playground')) {
    return 'parent_child'
  }

  if (includesAny(query, ['寵物', '毛孩', '狗狗', '遛狗']) || requestedFeatures.includes('pet_friendly')) {
    return 'pet'
  }

  if (includesAny(query, ['無障礙', '輪椅', '嬰兒車', '推車']) || requestedFeatures.includes('accessible')) {
    return 'accessibility'
  }

  if (includesAny(query, ['運動', '籃球', '健走', '跑步']) || requestedFeatures.includes('basketball')) {
    return 'exercise'
  }

  if (includesAny(query, ['野餐', '草地']) || requestedFeatures.includes('picnic')) {
    return 'picnic'
  }

  return query ? 'general' : undefined
}

export const featureLabels: Record<ParkFeatureType, string> = {
  toilet: '廁所',
  playground: '遊戲場',
  accessible: '無障礙',
  pet_friendly: '寵物友善',
  mrt_nearby: '捷運可到',
  ubike: 'YouBike',
  parking: '停車',
  shade: '遮蔭',
  basketball: '籃球',
  picnic: '野餐',
  trail: '步道'
}
