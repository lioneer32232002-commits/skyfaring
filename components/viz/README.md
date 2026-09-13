# components/viz

版面上的小圖表。全部是 server 元件，輸出 inline SVG 或 div，沒有 client JS、沒有圖表函式庫。

- `StatTile`：一個數字加一行說明的數字磚，`StatRow` 把數字磚排成手機兩欄、桌機 `cols` 欄（預設 4）。
- `BarRow`：水平長條清單，比較同一組項目的數量，例如主題群或分類的篇數。
- `MiniColumns`：小柱狀圖，看每月發文量，最後一根柱子代表當月。
- `CadenceStrip`：12 格代表一年 12 個月，標示儀表板的更新頻率。週更每格畫短橫線、
  月更每格一顆圓點、季更只亮 1、4、7、10 月，三種節奏是三種形狀，不靠亮度分辨。
  `cadenceFromLabel("每月累積更新")` 把資料裡的節奏字串換成 `"週" | "月" | "季"`。

## 資料從哪來

數字一律來自 `lib/siteStats.ts`（`getTopicCounts`、`getCategoryCounts`、`getMonthlyCounts`、
`getSiteSummary`），在 build 時讀 `content/posts` 的 frontmatter 與 `lib/projects.ts` 算完。
元件只負責畫，不自己讀檔、不自己抓 API。

## 設計決定

- **單一色相**：資料一律用 sky，其餘用中性的 slate。不做分類色盤，因為這些圖比較的是數量大小，
  不是身分，用多個色相只會把「哪個最大」這件事變難讀。
- **直接標籤**：每個項目旁邊都有自己的文字標籤與數值，所以不需要圖例，也不需要色彩對照。
  `MiniColumns` 只標最高的一根，其餘數值放在 `sr-only` 的表格裡。
- **文字不上資料色**：標籤與數值一律用 slate 文字色，顏色只出現在長條、柱子與方點上。
- 深淺色兩套類別都要寫齊，深色靠 `app/globals.css` 的 `@custom-variant dark`。
