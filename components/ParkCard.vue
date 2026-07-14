<script setup lang="ts">
import type { ParkRecommendation } from '~/types/park'

const props = defineProps<{
  recommendation: ParkRecommendation
}>()

</script>

<template>
  <article class="rounded-xl border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-xs font-semibold text-park-moss">{{ recommendation.park.city }} · {{ recommendation.park.district }}</p>
        <h2 class="mt-1 text-lg font-bold text-stone-950">{{ recommendation.park.name }}</h2>
      </div>
      <div class="rounded-md bg-stone-900 px-2.5 py-1 text-sm font-semibold text-white">
        {{ recommendation.score }}
      </div>
    </div>

    <p class="mt-2 text-sm leading-6 text-stone-600">{{ recommendation.park.address }}</p>
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

    <div class="mt-4 flex items-center justify-between border-t border-stone-100 pt-3 text-xs text-stone-500">
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
