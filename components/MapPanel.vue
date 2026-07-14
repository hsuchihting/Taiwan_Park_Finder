<script setup lang="ts">
defineProps<{
  count: number
  source: 'twinkle-hub' | 'mock'
  city?: string
}>()
</script>

<template>
  <section class="overflow-hidden rounded-2xl border border-white/80 bg-white/75 shadow-xl shadow-emerald-950/10 backdrop-blur">
    <div class="relative flex h-72 items-center justify-center bg-[radial-gradient(circle_at_65%_30%,#f6c45355,transparent_28%),linear-gradient(145deg,#d8eef5,#d8ead2)] p-6">
      <div class="absolute left-7 top-7 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-stone-700 shadow-sm">
        {{ city || '全台灣' }}資料範圍
      </div>
      <div class="text-center">
        <div class="mx-auto flex h-32 w-24 rotate-6 items-center justify-center rounded-[45%_55%_58%_42%/35%_42%_58%_65%] bg-park-leaf text-white shadow-lg shadow-emerald-900/20">
          <span class="-rotate-6 text-3xl font-black">{{ count }}</span>
        </div>
        <p class="mt-5 text-sm font-semibold text-stone-700">本次符合條件的公園</p>
      </div>
    </div>
    <div class="border-t border-stone-200 p-4">
      <h2 class="text-base font-bold text-stone-950">{{ source === 'twinkle-hub' ? 'Twinkle Hub 官方開放資料' : '台北示範資料' }}</h2>
      <p class="mt-1 text-sm leading-6 text-stone-600">
        依縣市、需求與設施條件即時篩選，資料來源與授權資訊保留在結果下方。
      </p>
    </div>
  </section>
</template>
