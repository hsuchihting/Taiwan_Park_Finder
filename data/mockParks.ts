import type { FeatureConfidence, Park, ParkFeatureType } from '~/types/park'
import { featureLabels } from '~/utils/parkParser'

const feature = (type: ParkFeatureType, confidence: FeatureConfidence) => ({
  type,
  label: featureLabels[type],
  confidence
})

export const mockParks: Park[] = [
  {
    id: 'daan-forest-park',
    name: '大安森林公園',
    city: '台北市',
    district: '大安區',
    address: '台北市大安區新生南路二段1號',
    description: '大型都會森林公園，鄰近捷運站，適合親子散步、野餐與休憩。',
    latitude: 25.0328,
    longitude: 121.5359,
    sourceName: 'Taiwan Park Finder Mock Data',
    lastVerifiedAt: '2026-06-26',
    features: [
      feature('toilet', 'official'),
      feature('playground', 'mock'),
      feature('accessible', 'official'),
      feature('mrt_nearby', 'official'),
      feature('ubike', 'mock'),
      feature('shade', 'official'),
      feature('picnic', 'mock'),
      feature('trail', 'mock')
    ]
  },
  {
    id: 'rongxing-garden-park',
    name: '榮星花園公園',
    city: '台北市',
    district: '中山區',
    address: '台北市中山區民權東路三段1號',
    description: '社區型公園，遊戲區、草地與步道兼具。',
    latitude: 25.0644,
    longitude: 121.5426,
    sourceName: 'Taiwan Park Finder Mock Data',
    lastVerifiedAt: '2026-06-26',
    features: [
      feature('toilet', 'mock'),
      feature('playground', 'official'),
      feature('accessible', 'mock'),
      feature('mrt_nearby', 'mock'),
      feature('ubike', 'mock'),
      feature('shade', 'mock'),
      feature('picnic', 'mock')
    ]
  },
  {
    id: 'xinsheng-park',
    name: '新生公園',
    city: '台北市',
    district: '中山區',
    address: '台北市中山區新生北路三段105號',
    description: '鄰近花博園區，環境開闊，適合慢走與親子活動。',
    latitude: 25.0704,
    longitude: 121.5306,
    sourceName: 'Taiwan Park Finder Mock Data',
    lastVerifiedAt: '2026-06-26',
    features: [
      feature('toilet', 'official'),
      feature('playground', 'mock'),
      feature('accessible', 'official'),
      feature('mrt_nearby', 'mock'),
      feature('parking', 'mock'),
      feature('shade', 'official'),
      feature('trail', 'mock')
    ]
  },
  {
    id: 'youth-park',
    name: '青年公園',
    city: '台北市',
    district: '萬華區',
    address: '台北市萬華區水源路199號',
    description: '腹地寬廣，有運動設施、遊戲區與綠蔭步道。',
    latitude: 25.0222,
    longitude: 121.5065,
    sourceName: 'Taiwan Park Finder Mock Data',
    lastVerifiedAt: '2026-06-26',
    features: [
      feature('toilet', 'official'),
      feature('playground', 'official'),
      feature('accessible', 'mock'),
      feature('ubike', 'mock'),
      feature('parking', 'mock'),
      feature('shade', 'official'),
      feature('basketball', 'official'),
      feature('trail', 'mock')
    ]
  },
  {
    id: 'meiti-riverside-park',
    name: '美堤河濱公園',
    city: '台北市',
    district: '中山區',
    address: '台北市中山區基隆河大直橋至中山橋間',
    description: '河濱空間寬敞，適合寵物散步、野餐與單車活動。',
    latitude: 25.0752,
    longitude: 121.5605,
    sourceName: 'Taiwan Park Finder Mock Data',
    lastVerifiedAt: '2026-06-26',
    features: [
      feature('toilet', 'mock'),
      feature('pet_friendly', 'mock'),
      feature('accessible', 'mock'),
      feature('ubike', 'mock'),
      feature('parking', 'mock'),
      feature('shade', 'inferred'),
      feature('picnic', 'mock'),
      feature('trail', 'mock')
    ]
  },
  {
    id: 'guandu-nature-park',
    name: '關渡自然公園',
    city: '台北市',
    district: '北投區',
    address: '台北市北投區關渡路55號',
    description: '自然濕地公園，適合生態觀察、步道散策與親子自然教育。',
    latitude: 25.1174,
    longitude: 121.4691,
    sourceName: 'Taiwan Park Finder Mock Data',
    lastVerifiedAt: '2026-06-26',
    features: [
      feature('toilet', 'official'),
      feature('accessible', 'mock'),
      feature('mrt_nearby', 'mock'),
      feature('parking', 'mock'),
      feature('shade', 'mock'),
      feature('picnic', 'mock'),
      feature('trail', 'official')
    ]
  },
  {
    id: 'tianmu-sports-park',
    name: '天母運動公園',
    city: '台北市',
    district: '士林區',
    address: '台北市士林區忠誠路二段77號',
    description: '運動設施豐富，鄰近商圈，適合球類活動與家庭休閒。',
    latitude: 25.1135,
    longitude: 121.5318,
    sourceName: 'Taiwan Park Finder Mock Data',
    lastVerifiedAt: '2026-06-26',
    features: [
      feature('toilet', 'mock'),
      feature('playground', 'mock'),
      feature('accessible', 'mock'),
      feature('pet_friendly', 'mock'),
      feature('ubike', 'mock'),
      feature('parking', 'mock'),
      feature('shade', 'mock'),
      feature('basketball', 'official')
    ]
  },
  {
    id: 'fuyang-eco-park',
    name: '富陽自然生態公園',
    city: '台北市',
    district: '大安區',
    address: '台北市大安區富陽街底',
    description: '森林感強的生態公園，適合步道、遮蔭與自然觀察。',
    latitude: 25.0182,
    longitude: 121.5571,
    sourceName: 'Taiwan Park Finder Mock Data',
    lastVerifiedAt: '2026-06-26',
    features: [
      feature('toilet', 'mock'),
      feature('mrt_nearby', 'mock'),
      feature('shade', 'official'),
      feature('trail', 'official'),
      feature('pet_friendly', 'inferred')
    ]
  },
  {
    id: '228-peace-park',
    name: '二二八和平公園',
    city: '台北市',
    district: '中正區',
    address: '台北市中正區凱達格蘭大道3號',
    description: '市中心歷史公園，交通方便，有綠蔭與休憩空間。',
    latitude: 25.0407,
    longitude: 121.5153,
    sourceName: 'Taiwan Park Finder Mock Data',
    lastVerifiedAt: '2026-06-26',
    features: [
      feature('toilet', 'official'),
      feature('accessible', 'official'),
      feature('mrt_nearby', 'official'),
      feature('ubike', 'mock'),
      feature('shade', 'official'),
      feature('trail', 'mock')
    ]
  },
  {
    id: 'da-hu-park',
    name: '大湖公園',
    city: '台北市',
    district: '內湖區',
    address: '台北市內湖區成功路五段31號',
    description: '湖景與捷運站相鄰，適合散步、拍照與家庭休閒。',
    latitude: 25.0838,
    longitude: 121.6022,
    sourceName: 'Taiwan Park Finder Mock Data',
    lastVerifiedAt: '2026-06-26',
    features: [
      feature('toilet', 'official'),
      feature('playground', 'mock'),
      feature('accessible', 'mock'),
      feature('mrt_nearby', 'official'),
      feature('ubike', 'mock'),
      feature('parking', 'mock'),
      feature('shade', 'mock'),
      feature('picnic', 'mock'),
      feature('trail', 'mock')
    ]
  }
]
