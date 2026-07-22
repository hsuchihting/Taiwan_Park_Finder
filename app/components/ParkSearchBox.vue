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
  <form class="rounded-2xl border-2 border-sky-200 bg-white p-2 shadow-[0_5px_0_#bae6fd]" @submit.prevent="submitSearch">
    <label class="sr-only" for="park-search">搜尋公園</label>
    <div class="flex flex-col gap-3 sm:flex-row">
      <input
        id="park-search"
        v-model="localQuery"
        class="min-h-12 flex-1 rounded-xl border-0 px-3 text-base outline-none transition placeholder:text-stone-400 focus:bg-sky-50 focus:ring-2 focus:ring-sky-200"
        placeholder="例如：適合小孩、有廁所、捷運可到"
        type="search"
      >
      <button
        class="min-h-12 rounded-xl bg-park-clay px-6 text-base font-black text-white shadow-[0_4px_0_#d94f43] transition hover:-translate-y-0.5 hover:bg-[#ff6758] hover:shadow-[0_5px_0_#d94f43] focus:outline-none focus:ring-4 focus:ring-orange-200 disabled:cursor-wait disabled:opacity-60"
        :disabled="props.loading"
        type="submit"
      >
        {{ props.loading ? '查詢資料中…' : '搜尋公園' }}
      </button>
    </div>
  </form>
</template>
