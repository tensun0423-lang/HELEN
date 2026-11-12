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

## 西屯美食轉盤
- 網址（GitHub Pages）：https://tensun0423-lang.github.io/HELEN/food-wheel/
- 檔案在 `food-wheel/`：`index.html`、`style.css`、`app.js`、`data.js`（店家名單與資料來源）
- 純 HTML/CSS/JavaScript，不需要安裝或建置，也不會連到 Supabase。
- 要增減店家，修改 `food-wheel/data.js` 即可。
