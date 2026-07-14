import type { Park, ParkFeatureType, ParkRecommendation, ParkSearchQuery } from '~/types/park'
import { featureLabels } from '~/utils/parkParser'

const confidenceScore = {
  official: 5,
  user_reported: 3,
  inferred: 0
} as const

const intentFeatures: Record<NonNullable<ParkSearchQuery['intent']>, ParkFeatureType[]> = {
  parent_child: ['playground', 'toilet', 'shade'],
  pet: ['pet_friendly', 'shade', 'trail'],
  accessibility: ['accessible', 'toilet', 'mrt_nearby'],
  exercise: ['basketball', 'trail', 'ubike'],
  picnic: ['picnic', 'shade', 'toilet'],
  general: []
}

const featureSetFor = (park: Park) => new Set(park.features.map((feature) => feature.type))

const matchedIn = (requested: ParkFeatureType[], available: Set<ParkFeatureType>) =>
  requested.filter((feature) => available.has(feature))

const makeReason = (
  query: ParkSearchQuery,
  matchedFeatures: ParkFeatureType[],
  missingFeatures: ParkFeatureType[]
) => {
  if (matchedFeatures.length === 0) {
    return query.rawText ? '目前只符合少量條件，可作為備選參考。' : '推薦台北市具代表性的公園。'
  }

  const matchedText = matchedFeatures.map((feature) => featureLabels[feature]).join('、')
  const missingText = missingFeatures.map((feature) => featureLabels[feature]).join('、')

  if (missingFeatures.length > 0) {
    return `符合 ${matchedText}，但缺少 ${missingText}。`
  }

  return `符合 ${matchedText} 等需求。`
}

const makeConfidenceLabel = (park: Park, matchedFeatures: ParkFeatureType[]) => {
  const matched = park.features.filter((feature) => matchedFeatures.includes(feature.type))

  if (matched.some((feature) => feature.confidence === 'official')) {
    return '含官方資料'
  }

  if (matched.some((feature) => feature.confidence === 'user_reported')) {
    return '含使用者回報'
  }

  return '推測資料'
}

export const scorePark = (park: Park, query: ParkSearchQuery): ParkRecommendation => {
  const availableFeatures = featureSetFor(park)
  const mustHaveMatches = matchedIn(query.mustHave, availableFeatures)
  const niceToHaveMatches = matchedIn(query.niceToHave, availableFeatures)
  const requestedIntentFeatures = query.intent ? intentFeatures[query.intent] : []
  const intentMatches = matchedIn(requestedIntentFeatures, availableFeatures)
  const matchedFeatures = [...new Set([...mustHaveMatches, ...niceToHaveMatches, ...intentMatches])]
  const missingFeatures = query.mustHave.filter((feature) => !availableFeatures.has(feature))

  const confidenceBonus = park.features
    .filter((feature) => matchedFeatures.includes(feature.type))
    .reduce((sum, feature) => sum + confidenceScore[feature.confidence], 0)

  const score =
    mustHaveMatches.length * 30 +
    niceToHaveMatches.length * 12 +
    intentMatches.length * 15 -
    missingFeatures.length * 20 +
    confidenceBonus

  return {
    park,
    score,
    matchedFeatures,
    missingFeatures,
    reason: makeReason(query, matchedFeatures, missingFeatures),
    confidenceLabel: makeConfidenceLabel(park, matchedFeatures)
  }
}

export const rankParks = (parks: Park[], query: ParkSearchQuery): ParkRecommendation[] =>
  parks
    .filter((park) => !query.city || park.city.includes(query.city) || park.address.includes(query.city))
    .filter((park) => !query.district || park.district.includes(query.district) || park.address.includes(query.district))
    .map((park) => scorePark(park, query))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return b.matchedFeatures.length - a.matchedFeatures.length
    })
    .filter((recommendation) => recommendation.score > 0 || query.rawText.length === 0)
