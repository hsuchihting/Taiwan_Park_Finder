<script setup lang="ts">
const props = defineProps<{
  modelValue: string
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  search: [value: string]
}>()

const localQuery = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value)
})

const submitSearch = () => {
  emit('search', localQuery.value)
}
</script>

<template>
  <form class="rounded-xl border border-stone-200 bg-white p-2 shadow-sm" @submit.prevent="submitSearch">
    <label class="sr-only" for="park-search">搜尋公園</label>
    <div class="flex flex-col gap-3 sm:flex-row">
      <input
        id="park-search"
        v-model="localQuery"
        class="min-h-12 flex-1 rounded-lg border-0 px-3 text-base outline-none transition focus:ring-2 focus:ring-emerald-100"
        placeholder="例如：適合小孩、有廁所、捷運可到"
        type="search"
      >
      <button
        class="min-h-12 rounded-lg bg-park-leaf px-5 text-base font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:cursor-wait disabled:opacity-60"
        :disabled="props.loading"
        type="submit"
      >
        {{ props.loading ? '查詢資料中…' : '搜尋公園' }}
      </button>
    </div>
  </form>
</template>
