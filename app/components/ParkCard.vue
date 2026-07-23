<script setup lang="ts">
import type { ParkRecommendation } from '#shared/types/park'
import { buildGoogleMapsUrl, hasParkCoordinates } from '~/utils/googleMaps'

const props = defineProps<{
  recommendation: ParkRecommendation
}>()

</script>

<template>
  <article class="rounded-3xl border-2 border-sky-200 bg-white p-5 shadow-[0_7px_0_#bae6fd] transition hover:-translate-y-1 hover:shadow-[0_9px_0_#86d8f7]">
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-xs font-bold text-park-moss">🌿 {{ recommendation.park.city }} · {{ recommendation.park.district }}</p>
        <h2 class="mt-1 text-lg font-black text-stone-900">{{ recommendation.park.name }}</h2>
      </div>
      <div class="rounded-full border-2 border-amber-300 bg-park-sun px-3 py-1.5 text-sm font-black text-amber-900 shadow-[0_3px_0_#f0b92b]">
        ⭐ {{ recommendation.score }}
      </div>
    </div>

    <p class="mt-2 text-sm leading-6 text-stone-600">
      {{ recommendation.park.address || '原始資料未提供地址' }}
      <span v-if="recommendation.park.locationSource === 'openstreetmap'" class="ml-1 text-xs text-stone-400">（地址：OpenStreetMap）</span>
    </p>
    <p v-if="recommendation.park.description" class="mt-2 line-clamp-2 text-sm leading-6 text-stone-500">{{ recommendation.park.description }}</p>
    <p class="mt-3 text-sm leading-6 text-stone-700">{{ recommendation.reason }}</p>

    <div class="mt-4 flex flex-wrap gap-2">
      <FeatureBadge
        v-for="feature in recommendation.park.features"
        :key="`${recommendation.park.id}-${feature.type}`"
        :type="feature.type"
        :confidence="feature.confidence"
        :matched="recommendation.matchedFeatures.includes(feature.type)"
      />
    </div>

    <a
      :href="buildGoogleMapsUrl(recommendation.park)"
      class="mt-4 inline-flex min-h-10 items-center rounded-xl border-2 border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-800 shadow-[0_3px_0_#86efac] transition hover:-translate-y-0.5 hover:bg-emerald-100"
      target="_blank"
      rel="noopener noreferrer"
    >
      📍 {{ hasParkCoordinates(recommendation.park) ? '在 Google Maps 查看' : '在 Google Maps 搜尋' }}
    </a>
    <p v-if="!hasParkCoordinates(recommendation.park)" class="mt-2 text-xs text-stone-400">目前沒有可用座標，將以名稱與地區搜尋。</p>

    <div class="mt-4 flex items-center justify-between border-t-2 border-dashed border-sky-100 pt-3 text-xs text-stone-500">
      <a
        v-if="recommendation.park.sourceUrl"
        :href="recommendation.park.sourceUrl"
        class="text-park-leaf hover:underline"
        target="_blank"
        rel="noreferrer"
      >{{ recommendation.park.sourceName || recommendation.confidenceLabel }} ↗</a>
      <span v-else>{{ recommendation.park.sourceName || recommendation.confidenceLabel }}</span>
      <span>推薦分數 {{ recommendation.score }}</span>
    </div>
  </article>
</template>
