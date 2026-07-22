<script setup lang="ts">
defineProps<{
  count: number
  source: 'twinkle-hub'
  city?: string
}>()
</script>

<template>
  <section class="rotate-1 overflow-hidden rounded-[2rem] border-4 border-white bg-white/90 shadow-[0_12px_0_rgba(37,169,91,0.22)] backdrop-blur transition hover:rotate-0">
    <div class="relative flex h-72 items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_18%_18%,#ffffffaa_0_28px,transparent_29px),radial-gradient(circle_at_80%_26%,#ffffff99_0_40px,transparent_41px),linear-gradient(180deg,#a8e5ff_0%,#d8f4ff_58%,#9ee18d_59%,#5fc96f_100%)] p-6">
      <div class="absolute -left-5 bottom-8 text-6xl">🌳</div>
      <div class="absolute -right-3 bottom-6 text-6xl">🌈</div>
      <div class="absolute right-6 top-5 text-4xl">☀️</div>
      <div class="absolute left-7 top-7 rounded-full border-2 border-sky-200 bg-white/95 px-4 py-2 text-xs font-black text-sky-700 shadow-sm">
        📍 {{ city || '全台灣' }}資料範圍
      </div>
      <div class="text-center">
        <div class="mx-auto flex h-32 w-32 -rotate-3 items-center justify-center rounded-full border-4 border-white bg-park-sun text-amber-900 shadow-[0_8px_0_#efb927]">
          <span class="rotate-3 text-4xl font-black">{{ count }}</span>
        </div>
        <p class="mt-5 rounded-full bg-white/90 px-4 py-2 text-sm font-black text-emerald-800">找到這麼多好玩公園！</p>
      </div>
    </div>
    <div class="border-t-2 border-dashed border-sky-200 p-4">
      <h2 class="text-base font-black text-stone-900">🧭 Twinkle Hub 公園探險資料</h2>
      <p class="mt-1 text-sm leading-6 text-stone-600">
        依縣市、需求與設施條件即時篩選，資料來源與授權資訊保留在結果下方。
      </p>
    </div>
  </section>
</template>
