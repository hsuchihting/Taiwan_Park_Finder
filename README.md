# Taiwan Park Finder

以 Nuxt 3 製作的全台灣公園探索網站，透過 Twinkle Hub MCP 查詢台灣政府開放資料，並依使用者的自然語言條件排序推薦結果。

## 功能

- 支援台灣 22 縣市選擇與逐縣市查詢
- 可用「親子、有廁所、寵物友善、無障礙」等自然語言搜尋
- 由伺服器端連接 Twinkle Hub MCP，API key 不會送進瀏覽器
- 顯示來源資料集、主管機關與授權資訊
- MCP 暫時無法使用時，自動以示範資料維持基本體驗

## 本機設定

1. 安裝套件：

   ```bash
   npm install
   ```

2. 複製 `.env.example` 為 `.env`，填入 Twinkle Hub API key：

   ```dotenv
   NUXT_TWINKLE_HUB_API_KEY=sk-your-key
   ```

   請勿使用 `NUXT_PUBLIC_` 前綴，也不要把 `.env` 提交到版本控制。

3. 啟動開發環境：

   ```bash
   npm run dev
   ```

## 建置與預覽

```bash
npm run build
npm run preview
```

部署時，請在主機平台的伺服器端環境變數設定 `NUXT_TWINKLE_HUB_API_KEY`。純靜態主機無法安全保存 API key；必須使用能執行 Nuxt/Nitro server routes 的環境。

## 串接架構

```text
瀏覽器
  -> POST /api/parks（不含 API key）
  -> Nuxt/Nitro server
  -> Twinkle Hub MCP（Authorization: Bearer ...）
  -> 搜尋資料集、查詢資料列、正規化公園欄位
  -> 回傳安全的公園與資料來源資訊
```

目前依 Twinkle Hub 線上 MCP 實際提供的工具呼叫：

- `search_datasets`
- `get_dataset`
- `query_rows`

主要實作位於：

- `server/utils/twinkleMcp.ts`：MCP Streamable HTTP 與 SSE 回應處理
- `server/api/parks.post.ts`：安全的伺服器 API、資料集搜尋與欄位正規化
- `utils/parkParser.ts`：22 縣市與自然語言條件解析
- `utils/parkScoring.ts`：推薦排序

## 資料範圍說明

網站會針對選定縣市即時搜尋 Twinkle Hub 中可用的政府開放資料。各縣市資料的欄位、更新頻率與完整度由原始發布機關決定，因此某些公園可能缺少地址、座標或設施資訊；頁面會保留資料集來源供查核。
