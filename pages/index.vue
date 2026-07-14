<script setup lang="ts">
import { taiwanCities } from '~/utils/parkParser'

const {
  query,
  selectedCity,
  recommendations,
  isLoading,
  source,
  sourceMessage,
  searchError,
  datasets,
  search
} = useParkSearch()

const quickQueries = ['親子遊戲場、有廁所', '寵物友善、有遮蔭', '嬰兒車、無障礙', '籃球場、停車方便']
</script>

<template>
  <main class="min-h-screen">
    <section class="relative overflow-hidden bg-[#e9f4ee]">
      <div class="absolute -right-24 -top-28 h-80 w-80 rounded-full bg-park-sun/30 blur-3xl" />
      <div class="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-park-sky blur-3xl" />
      <div class="relative mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-16">
        <div class="flex flex-col justify-center">
          <div class="flex flex-wrap items-center gap-2 text-sm font-semibold text-park-moss">
            <span class="rounded-full bg-white/80 px-3 py-1">Taiwan Park Finder</span>
            <span class="rounded-full bg-emerald-700 px-3 py-1 text-white">Twinkle Hub × 台灣開放資料</span>
          </div>
          <h1 class="mt-3 max-w-3xl text-4xl font-bold leading-tight text-stone-950 sm:text-5xl">
            一句話，找到全台灣<br class="hidden sm:block">最適合你的公園
          </h1>
          <p class="mt-4 max-w-2xl text-lg leading-8 text-stone-700">
            用一句話搜尋親子、寵物、無障礙、運動與交通友善的公園
          </p>
          <div class="mt-7 space-y-3 rounded-2xl border border-white/70 bg-white/65 p-3 shadow-xl shadow-emerald-950/5 backdrop-blur">
            <label class="block">
              <span class="sr-only">選擇縣市</span>
              <select
                v-model="selectedCity"
                class="min-h-11 w-full rounded-xl border border-stone-200 bg-white px-4 text-sm font-medium text-stone-700 outline-none focus:border-park-leaf sm:w-52"
              >
                <option value="">全台灣</option>
                <option v-for="city in taiwanCities" :key="city" :value="city">{{ city }}</option>
              </select>
            </label>
            <ParkSearchBox v-model="query" :loading="isLoading" @search="search" />
          </div>
          <div class="mt-4 flex flex-wrap gap-2">
            <button
              v-for="quickQuery in quickQueries"
              :key="quickQuery"
              class="rounded-full border border-white/80 bg-white/70 px-3 py-1.5 text-sm font-medium text-stone-700 transition hover:bg-white"
              type="button"
              @click="search(quickQuery)"
            >
              {{ quickQuery }}
            </button>
          </div>
        </div>

        <MapPanel :count="recommendations.length" :source="source" :city="selectedCity" />
      </div>
    </section>

    <section class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div
        v-if="searchError"
        class="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
      >
        {{ searchError }}
      </div>
      <div
        v-else
        class="mb-6 flex flex-col gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 sm:flex-row sm:items-center sm:justify-between"
      >
        <p><strong>Twinkle Hub 開放資料</strong> · {{ sourceMessage }}</p>
        <span v-if="datasets?.length" class="shrink-0 text-xs">來自 {{ datasets.length }} 個開放資料集</span>
      </div>

      <div class="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <p class="text-sm font-semibold text-park-moss">搜尋結果</p>
          <h2 class="mt-1 text-2xl font-bold text-stone-950">{{ selectedCity || '全台灣' }}推薦公園</h2>
        </div>
        <p class="text-sm text-stone-500">依條件符合度與信心分數排序</p>
      </div>

      <div v-if="isLoading" class="grid gap-4 lg:grid-cols-2" aria-live="polite">
        <div v-for="index in 4" :key="index" class="h-56 animate-pulse rounded-xl bg-stone-200" />
      </div>
      <div v-else-if="recommendations.length > 0" class="grid gap-4 lg:grid-cols-2">
        <ParkCard
          v-for="recommendation in recommendations"
          :key="recommendation.park.id"
          :recommendation="recommendation"
        />
      </div>
      <div v-else class="rounded-lg border border-dashed border-stone-300 bg-white p-8 text-center text-stone-600">
        找不到符合條件的公園。請放寬設施條件，或改選其他縣市。
      </div>

      <details v-if="datasets?.length" class="mt-8 rounded-xl border border-stone-200 bg-white p-4 text-sm">
        <summary class="cursor-pointer font-semibold text-stone-800">查看本次官方資料來源</summary>
        <ul class="mt-3 space-y-2 text-stone-600">
          <li v-for="dataset in datasets" :key="dataset.id" class="flex flex-col sm:flex-row sm:justify-between sm:gap-4">
            <a v-if="dataset.sourceUrl" class="text-park-leaf underline-offset-2 hover:underline" :href="dataset.sourceUrl" target="_blank" rel="noreferrer">{{ dataset.title }}</a>
            <span v-else>{{ dataset.title }}</span>
            <span class="text-xs text-stone-400">{{ dataset.license || '授權資訊見原始資料' }}</span>
          </li>
        </ul>
      </details>
    </section>
  </main>
</template>
