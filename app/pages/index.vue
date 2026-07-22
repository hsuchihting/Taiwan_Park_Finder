<script setup lang="ts">
import { taiwanCities } from '#shared/utils/parkParser'

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

const pageSize = ref(10)
const currentPage = ref(1)
const pageSizeOptions = [10, 20, 50]

const totalPages = computed(() => Math.max(1, Math.ceil(recommendations.value.length / pageSize.value)))
const paginatedRecommendations = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return recommendations.value.slice(start, start + pageSize.value)
})
const visiblePages = computed(() => {
  const visibleCount = 5
  const start = Math.max(1, Math.min(currentPage.value - 2, totalPages.value - visibleCount + 1))
  const end = Math.min(totalPages.value, start + visibleCount - 1)
  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
})

watch(recommendations, () => {
  currentPage.value = 1
})

// 切換每頁筆數時保留目前頁碼；只有超出新範圍才移到最後一頁。
watch(pageSize, () => {
  currentPage.value = Math.min(currentPage.value, totalPages.value)
})

const goToPage = (page: number) => {
  currentPage.value = Math.min(Math.max(page, 1), totalPages.value)
}
</script>

<template>
  <main class="min-h-screen overflow-hidden">
    <section class="relative overflow-hidden bg-park-sky">
      <img
        class="absolute inset-0 h-full w-full object-cover object-center"
        src="https://unsplash.com/photos/SJ3l3beX3XQ/download?force=true&amp;w=2000"
        alt=""
      >
      <div class="absolute inset-0 bg-gradient-to-r from-sky-100/95 via-white/80 to-emerald-100/35" />
      <div class="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-park-sun/80 blur-sm" />
      <div class="absolute left-[48%] top-10 hidden text-5xl drop-shadow-md lg:block">☁️</div>
      <div class="absolute bottom-8 left-[45%] hidden text-5xl drop-shadow-md lg:block">🦋</div>
      <div class="relative mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-16">
        <div class="flex flex-col justify-center">
          <div class="flex flex-wrap items-center gap-2 text-sm font-black">
            <span class="rounded-full border-2 border-sky-300 bg-white/95 px-4 py-2 text-sky-700 shadow-sm">🌈 Taiwan Park Finder</span>
            <span class="rounded-full border-2 border-emerald-400 bg-emerald-500 px-4 py-2 text-white shadow-sm">🌳 全台公園探險隊</span>
          </div>
          <h1 class="mt-5 max-w-3xl text-4xl font-black leading-tight text-sky-950 drop-shadow-[0_2px_0_white] sm:text-5xl">
            今天想去哪裡<br class="hidden sm:block"><span class="text-park-clay">開心玩公園？</span>
          </h1>
          <p class="mt-4 max-w-xl text-lg font-semibold leading-8 text-sky-950">
            告訴我們你想玩的設施，一起找到適合全家大小的快樂公園！
          </p>
          <div class="mt-7 space-y-3 rounded-[2rem] border-4 border-white/80 bg-white/90 p-4 shadow-[0_10px_0_rgba(56,189,248,0.25)] backdrop-blur">
            <label class="block">
              <span class="sr-only">選擇縣市</span>
              <select
                v-model="selectedCity"
                class="min-h-11 w-full rounded-xl border-2 border-amber-300 bg-yellow-50 px-4 text-sm font-bold text-amber-900 outline-none focus:border-park-sun focus:ring-4 focus:ring-yellow-100 sm:w-52"
              >
                <option value="">全台灣</option>
                <option v-for="city in taiwanCities" :key="city" :value="city">{{ city }}</option>
              </select>
            </label>
            <ParkSearchBox v-model="query" :loading="isLoading" @search="search" />
          </div>
          <div class="mt-5 flex flex-wrap gap-2">
            <button
              v-for="(quickQuery, index) in quickQueries"
              :key="quickQuery"
              class="rounded-full border-2 px-4 py-2 text-sm font-bold shadow-sm transition hover:-translate-y-0.5"
              :class="index % 2 === 0
                ? 'border-violet-300 bg-violet-100/95 text-violet-800 hover:bg-violet-200'
                : 'border-orange-300 bg-orange-100/95 text-orange-800 hover:bg-orange-200'"
              type="button"
              @click="search(quickQuery)"
            >
              {{ quickQuery }}
            </button>
          </div>
        </div>

        <MapPanel :count="recommendations.length" :source="source" :city="selectedCity" />
      </div>
      <a
        class="absolute bottom-2 right-3 rounded-full bg-black/45 px-3 py-1 text-[10px] text-white/90 hover:bg-black/60"
        href="https://unsplash.com/photos/SJ3l3beX3XQ"
        target="_blank"
        rel="noreferrer"
      >公園照片：Se. Tsuchiya / Unsplash</a>
    </section>

    <section class="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div
        v-if="searchError"
        class="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
      >
        {{ searchError }}
      </div>
      <div
        v-else
        class="mb-6 flex flex-col gap-2 rounded-2xl border-2 border-sky-200 bg-sky-50 px-5 py-4 text-sm text-sky-900 shadow-[0_4px_0_#bae6fd] sm:flex-row sm:items-center sm:justify-between"
      >
        <p><strong>Twinkle Hub 開放資料</strong> · {{ sourceMessage }}</p>
        <span v-if="datasets?.length" class="shrink-0 text-xs">來自 {{ datasets.length }} 個開放資料集</span>
      </div>

      <div class="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p class="text-sm font-black text-park-clay">🎉 搜尋結果</p>
          <h2 class="mt-1 text-2xl font-black text-stone-900">{{ selectedCity || '全台灣' }}推薦公園</h2>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <p class="text-sm text-stone-500">依條件符合度與信心分數排序</p>
          <label class="flex items-center gap-2 text-sm font-medium text-stone-700">
            每頁顯示
            <select
              v-model.number="pageSize"
              class="min-h-10 rounded-xl border-2 border-amber-300 bg-yellow-50 px-3 text-sm font-bold text-amber-900 outline-none focus:border-park-sun focus:ring-4 focus:ring-yellow-100"
              aria-label="每頁顯示筆數"
            >
              <option v-for="option in pageSizeOptions" :key="option" :value="option">{{ option }} 筆</option>
            </select>
          </label>
        </div>
      </div>

      <div v-if="isLoading" class="grid gap-4 lg:grid-cols-2" aria-live="polite">
        <div v-for="index in 4" :key="index" class="h-56 animate-pulse rounded-xl bg-stone-200" />
      </div>
      <div v-else-if="recommendations.length > 0" class="grid gap-4 lg:grid-cols-2">
        <ParkCard
          v-for="recommendation in paginatedRecommendations"
          :key="recommendation.park.id"
          :recommendation="recommendation"
        />
      </div>
      <div v-else class="rounded-lg border border-dashed border-stone-300 bg-white p-8 text-center text-stone-600">
        找不到符合條件的公園。請放寬設施條件，或改選其他縣市。
      </div>

      <nav
        v-if="!isLoading && recommendations.length > 0"
        class="mt-7 flex flex-col items-center justify-between gap-3 rounded-3xl border-2 border-violet-200 bg-white px-5 py-4 shadow-[0_6px_0_#ddd6fe] sm:flex-row"
        aria-label="公園搜尋結果分頁"
      >
        <p class="text-sm text-stone-500">
          第 {{ currentPage }} / {{ totalPages }} 頁，共 {{ recommendations.length }} 筆
        </p>
        <div class="flex flex-wrap items-center justify-center gap-1.5">
          <button
            type="button"
            class="min-h-10 rounded-xl border-2 border-sky-200 bg-sky-50 px-3 text-sm font-bold text-sky-700 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="currentPage === 1"
            aria-label="第一頁"
            @click="goToPage(1)"
          >
            首頁
          </button>
          <button
            type="button"
            class="min-h-10 rounded-xl border-2 border-sky-200 bg-sky-50 px-3 text-sm font-bold text-sky-700 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="currentPage === 1"
            aria-label="上一頁"
            @click="goToPage(currentPage - 1)"
          >
            上一頁
          </button>
          <button
            v-for="page in visiblePages"
            :key="page"
            type="button"
            class="min-h-10 min-w-10 rounded-xl border-2 px-3 text-sm font-black transition"
            :class="page === currentPage
              ? 'border-violet-500 bg-violet-500 text-white shadow-[0_3px_0_#7c3aed]'
              : 'border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100'"
            :aria-current="page === currentPage ? 'page' : undefined"
            :aria-label="`第 ${page} 頁`"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
          <button
            type="button"
            class="min-h-10 rounded-xl border-2 border-sky-200 bg-sky-50 px-3 text-sm font-bold text-sky-700 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="currentPage === totalPages"
            aria-label="下一頁"
            @click="goToPage(currentPage + 1)"
          >
            下一頁
          </button>
          <button
            type="button"
            class="min-h-10 rounded-xl border-2 border-sky-200 bg-sky-50 px-3 text-sm font-bold text-sky-700 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="currentPage === totalPages"
            aria-label="最後一頁"
            @click="goToPage(totalPages)"
          >
            末頁
          </button>
        </div>
      </nav>

      <details v-if="datasets?.length" class="mt-8 rounded-2xl border-2 border-emerald-200 bg-white p-5 text-sm shadow-[0_4px_0_#bbf7d0]">
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
