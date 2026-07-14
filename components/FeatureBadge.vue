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
  inferred: '推測'
}
</script>

<template>
  <span
    class="inline-flex items-center gap-1 rounded-full border-2 px-3 py-1 text-xs font-bold"
    :class="
      props.matched
        ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
        : 'border-sky-200 bg-sky-50 text-sky-700'
    "
  >
    {{ featureLabels[props.type] }}
    <span v-if="props.confidence" class="text-[10px] text-stone-400">
      {{ confidenceLabel[props.confidence] }}
    </span>
  </span>
</template>
