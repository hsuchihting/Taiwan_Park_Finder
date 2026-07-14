# Taiwan Park Finder 開發計畫書

## 1. 專案名稱

Taiwan Park Finder  
台灣公園智慧搜尋平台

## 2. 專案目標

打造一個以台灣公園為核心的 AI 搜尋平台，讓使用者可以用自然語言找到符合真實生活需求的公園。

本平台初期聚焦台北市，使用 mock data 建立可操作的 MVP，後續再串接 Twinkle Hub MCP 與政府開放資料，逐步擴展到全台灣。

## 3. 產品定位

Taiwan Park Finder 不是單純的公園列表，而是一個「以需求為導向」的公園推薦平台。

使用者不需要知道公園名稱，也不需要手動操作複雜篩選器，只要輸入一句話，例如：

- 台北市適合小孩、有廁所、捷運可到的公園
- 我想找寵物友善、有遮蔭的公園
- 有沒有適合嬰兒車和輪椅的公園？
- 下班後想找可以運動、有照明的公園
- 週末想帶小孩去有遊具和 YouBike 的公園

平台會解析使用者需求，並依據設施、交通、親子友善程度、無障礙程度、資料可信度等條件排序推薦。

## 4. MVP 範圍

### 4.1 第一版開發範圍

第一版只做 Nuxt 3 + Vue 3 前端與 mock search，不串接真實 API。

範圍如下：

- 台北市公園 mock data
- 自然語言搜尋輸入框
- Rule-based query parser
- 公園推薦排序
- 公園卡片列表
- Feature badges
- 地圖 placeholder
- 行動版友善 UI
- TypeScript 型別設計
- 可擴充的資料 provider 架構

### 4.2 第一版不做的事

第一版暫時不做：

- Twinkle Hub MCP 串接
- 真實政府資料匯入
- 登入系統
- 使用者回報資料庫
- 真實地圖 marker
- 路線規劃
- 即時天氣與空品
- 全台灣資料
- 後台管理系統

## 5. 技術選型

### 5.1 前端框架

- Nuxt 3
- Vue 3 Composition API
- TypeScript
- Tailwind CSS

### 5.2 資料來源

第一階段：

- 本地 mock data

第二階段：

- Twinkle Hub MCP
- 台灣政府開放資料
- 自建資料庫

### 5.3 後續可能使用

- PostgreSQL + PostGIS
- Supabase 或 Neon
- MapLibre 或 Leaflet
- Redis cache
- Twinkle Hub MCP adapter

## 6. 建議專案結構

```text
taiwan-park-finder/
  components/
    ParkSearchBox.vue
    ParkCard.vue
    FeatureBadge.vue
    MapPanel.vue

  composables/
    useParkSearch.ts

  data/
    mockParks.ts

  pages/
    index.vue

  types/
    park.ts

  utils/
    parkParser.ts
    parkScoring.ts

  docs/
    development-plan.md
    product-spec.md
    codex-tasks.md

  nuxt.config.ts
  tailwind.config.ts
  package.json
  README.md
```
