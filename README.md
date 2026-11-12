報修登記系統
用於登記與管理報修需求，方便追蹤處理進度。
雲端任務測試
- [報修欄位表](文件/報修欄位表.xlsx)：欄位定義與 10 筆虛構範例資料

## 網頁前端
- 網址（GitHub Pages）：https://tensun0423-lang.github.io/HELEN/
- 檔案：`index.html`（頁面）、`style.css`（樣式）、`app.js`（新增報修與讀取清單）、`config.js`（Supabase 網址與 publishable key）
- 純 HTML/CSS/JavaScript，透過 CDN 載入 supabase-js v2，不需要安裝或建置。
- 使用前要先在 Supabase 執行 `supabase/schema.sql` 建立資料表。
- `config.js` 只能放 publishable key，不能放 secret key。

## 台中美食轉盤（必比登＋在地私房名店）
- 網址（GitHub Pages）：https://tensun0423-lang.github.io/HELEN/food-wheel/
- 檔案在 `food-wheel/`：`index.html`、`style.css`、`app.js`、`data.js`（店家名單、行政區、來源類別與資料來源）
- 純 HTML/CSS/JavaScript，不需要安裝或建置，也不會連到 Supabase。
- 要增減店家，修改 `food-wheel/data.js` 即可。
- PWA：可以安裝到手機主畫面，第一次開啟後也能離線使用。
  - `manifest.webmanifest`：App 名稱、圖示、顏色
  - `sw.js`：Service Worker，有網路時抓最新版本並更新快取，離線時改用快取
  - `icons/`：App 圖示
  - 安裝方式：Android 的 Chrome 按頁面上的「安裝到主畫面」；iPhone 的 Safari 按「分享」→「加入主畫面」
  - 修改要離線使用的檔案後，把 `sw.js` 的 `CACHE_VERSION` 加 1，舊快取才會被清掉
