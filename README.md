# Taiwan Park Finder

以 **Nuxt 4.5** 製作的全台灣公園探索網站，透過 Twinkle Hub MCP 查詢政府開放資料，並依使用者的自然語言條件排序推薦結果。

## 線上預覽

[https://taiwanparkfinder.hsuchihting.workers.dev/](https://taiwanparkfinder.hsuchihting.workers.dev/)

網站部署於 **Cloudflare Workers**。Workers Builds 連接 GitHub repository 後，推送 `main` 會自動執行 Cloudflare 建置與部署。Nitro 在 Cloudflare 環境使用官方 `cloudflare` preset；本機則使用 Node server preset。

部署前請在 Cloudflare Worker 的 **Settings → Variables and Secrets** 新增伺服器端 Secret：

```dotenv
NUXT_TWINKLE_HUB_API_KEY=sk-your-key
```

API key 只會由 server route 使用，不會進入瀏覽器。請勿使用 `NUXT_PUBLIC_` 前綴，也不要把 `.env` 提交到版本控制。

## 功能

- 支援台灣 22 縣市選擇與逐縣市查詢
- 可用「親子、有廁所、寵物友善、無障礙」等自然語言搜尋
- 由伺服器端連接 Twinkle Hub MCP，API key 不會送進瀏覽器
- 顯示資料集來源、主管機關與授權資訊
- 公園資訊支援分頁，並可切換每頁顯示 10、20 或 50 筆；切換筆數時會保留目前頁數

## 技術版本與環境

- Nuxt `4.5.0`
- Vue `3.5.40`
- Vue Router `5.2.0`
- TypeScript `5.9.3`
- Tailwind CSS module `6.14.0`
- Node.js `24.11.1`（版本記錄於 `.node-version`）
- Wrangler `4.113.0`

## 專案結構

Nuxt 4 採用 `app/` 與 `shared/` 目錄：

```text
app/
  app.vue                 # 應用程式入口
  pages/                  # 頁面與路由
  components/             # 公園卡片、搜尋與地圖元件
  composables/            # 前端搜尋狀態與 API 邏輯
  utils/                  # 推薦評分
  assets/                 # Tailwind/CSS 資產
shared/
  types/park.ts           # 前後端共用型別
  utils/parkParser.ts     # 縣市與自然語言條件解析
server/
  api/parks.post.ts       # 即時公園查詢 API
  routes/data/parks.json.get.ts  # 建置時資料快照
  utils/                  # Twinkle Hub MCP 與資料正規化
```

## 本機開發

1. 安裝套件：

   ```bash
   npm install
   ```

2. 建立 `.env` 並填入 Twinkle Hub API key：

   ```dotenv
   NUXT_TWINKLE_HUB_API_KEY=sk-your-key
   ```

3. 啟動開發環境：

   ```bash
   npm run dev
   ```

## 檢查、建置與預覽

```bash
# 型別檢查
npm run typecheck

# Node server production build
npm run build
npm run preview

# Cloudflare Workers build
npm run build:cloudflare
```

`npm run build` 與 `npm run build:cloudflare` 預設會 prerender `/data/parks.json`，因此需要有效的 `NUXT_TWINKLE_HUB_API_KEY`。若只要在沒有外部資料服務時驗證前端與 Nitro 編譯，可暫時設定：

```powershell
$env:SKIP_PRERENDER='1'
npm run build
```

正式環境請使用能執行 Nuxt/Nitro server routes 的平台；純靜態主機無法安全保存 API key。

## 串接架構

```text
瀏覽器
  -> POST /api/parks（不含 API key）
  -> Nuxt/Nitro server（Cloudflare Worker）
  -> Twinkle Hub MCP（Authorization: Bearer ...）
  -> 搜尋資料集、查詢資料列、正規化公園欄位
  -> 回傳公園與資料來源資訊

備援：建置時會預先渲染 /data/parks.json 資料快照；
若 /api/parks 不可用，前端自動改讀快照並在本地排序推薦。
```

目前使用的 Twinkle Hub 工具：

- `search_datasets`
- `get_dataset`
- `query_rows`

主要實作：

- `server/utils/twinkleMcp.ts`：MCP Streamable HTTP 與 SSE 回應處理
- `server/utils/twinkleParks.ts`：資料集搜尋與公園欄位正規化
- `server/api/parks.post.ts`：伺服器即時查詢 API
- `server/routes/data/parks.json.get.ts`：建置時預先渲染的資料快照
- `shared/utils/parkParser.ts`：22 縣市與自然語言條件解析
- `app/utils/parkScoring.ts`：推薦排序

## 資料範圍說明

網站會針對選定縣市搜尋 Twinkle Hub 中可用的政府開放資料。各縣市資料的欄位、更新頻率與完整度由原始發布機關決定，因此部分公園可能缺少地址、座標或設施資訊；頁面會保留資料集來源供查核。
