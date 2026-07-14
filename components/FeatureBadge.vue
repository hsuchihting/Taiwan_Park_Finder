<script setup lang="ts">
import type { FeatureConfidence, ParkFeatureType } from '~/types/park'
import { featureLabels } from '~/utils/parkParser'

const props = defineProps<{
  type: ParkFeatureType
  confidence?: FeatureConfidence
  matched?: boolean
}>()

const confidenceLabel: Record<FeatureConfidence, string> = {
  official: '官方',
  user_reported: '回報',
  mock: '模擬',
  inferred: '推測'
}
</script>

<template>
  <span
    class="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium"
    :class="
      props.matched
        ? 'border-park-leaf bg-emerald-50 text-park-leaf'
        : 'border-stone-200 bg-white text-stone-600'
    "
  >
    {{ featureLabels[props.type] }}
    <span v-if="props.confidence" class="text-[10px] text-stone-400">
      {{ confidenceLabel[props.confidence] }}
    </span>
  </span>
</template>
