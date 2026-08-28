# 各網站 SEO / GEO 狀態表

> 對照 `playbook.md` 現行版（v1）。每站列：整體狀態、已到位項目、待辦（依影響排序）。
> 體檢報告原檔在當次 session 的 scratchpad，重要結論已摘進本檔；下次體檢以本檔為基準。

## skyfaring（skyfaring.net）

體檢：2026-08-21（playbook v1）。整體狀態：**基本盤完整，只剩小缺口**。

已到位：sitemap 全涵蓋（`app/sitemap.ts`）、逐頁 metadata 與 canonical、OG/Twitter card（hero 圖）、JSON-LD（BlogPosting、WebSite、BreadcrumbList、CollectionPage、ProfilePage）、SSG 靜態匯出、全文 RSS、pages.dev 與 www 301 轉址（`functions/_middleware.js`）、GSC＋GA4＋Cloudflare Analytics、日期四處一致輸出。

待辦：
1. ~~robots.txt 對 AI 爬蟲逐一列名~~ 已完成（2026-08-21）
2. Bing Webmaster Tools ＋ IndexNow（playbook 第 11 項，影響 ChatGPT 搜尋能見度；後台作業，需使用者操作或授權）
3. RSS feed 只收最新 30 篇（`app/feed.xml/route.ts:18`），評估放寬到全部 72 篇或維持現狀（feed 檔案大小取捨）

內容層備註（2026-08-28）：playbook 第 19 項（標題與子標題照搜尋意圖設計）已寫進 `CLAUDE.md`，新文章一律適用；舊文不批次改寫，目前只回頭重下過 `boeing-787-za001-test-pilots` 一篇。

## flight-deck（flightdecktw.net）

體檢：2026-08-21（playbook v1）。整體狀態：**工程量最深的一站，GEO 政策明確**。

已到位：robots.txt 有意識分流（放行搜尋型 AI 爬蟲、封鎖訓練型，全站範本）、sitemap 自動重建、逐頁 metadata、JSON-LD（Course、LearningResource、FAQPage、BreadcrumbList）、SPA noindex＋23 個靜態模組鏡像頁（渲染模式範本）、舊網域與 www 301、`_redirects` 擋內部檔案。

待辦：
1. ~~模組頁補 Twitter Card~~、~~sitemap 補 `/terms`~~ 已完成（2026-08-21，改 `tools/gen_module_pages.py` 重生）
2. GSC 與 Cloudflare Analytics 到後台確認仍生效（原始碼裡無 verification meta 與 beacon script，推測走 DNS 驗證與邊緣自動注入，`docs/HANDOFF.md` 有操作紀錄）
3. Bing Webmaster Tools ＋ IndexNow（後台作業）
4. 次要：hash 預覽網址是否要在 robots 擋，評估後決定

## eagle-wingchun（暫在 eagle-wingchun.pages.dev）

體檢：2026-08-21（playbook v1）。整體狀態：**結構化資料與在地 SEO 扎實，缺網域與量測**。

已到位：JSON-LD 全套（SportsActivityLocation＋Person＋Course＋FAQPage＋BreadcrumbList，含 `@id` 互參，在地實體範本）、純靜態輸出、逐頁 metadata（進站頁與 `/home/` 刻意分寫避免互相稀釋）、OG/Twitter card、GSC 雙重驗證、FAQ 直接回答潛在學員問題、Google Maps 嵌入。

待辦：
1. 接自訂網域（`build.mjs:17` 仍是 pages.dev；`README.md:120` 自列待辦。網域確定後改 `SITE.url`、設 301、更新 GSC）
2. 加站內 analytics（全站現無任何追蹤，看不到電話與 FB 點擊等轉換；GA4 或 Cloudflare Web Analytics 擇一）
3. ~~robots.txt 對 AI 爬蟲逐一列名~~ 已完成（2026-08-21，改 `build.mjs` 產生邏輯）
4. Bing Webmaster Tools ＋ IndexNow（後台作業）
5. 評估：學費補一個價格區間（現三處都寫「現場諮詢」，AI 被問價格答不出來；若刻意保密則維持）

## pla-tracker（pla-tracker.skyfaring.net）

體檢：2026-08-21（playbook v1）。整體狀態：**基本盤到位，剩加分項**。SEO 優先度中低（資料儀表板，非內容行銷站）。

已到位：Python build 時把資料寫死進靜態 HTML（零 JS 依賴）、逐頁 title/description/canonical、OG、hreflang（中英雙語）、sitemap、Cloudflare Pages 正式網域與 308 轉址。

待辦：
1. ~~首頁補 h1~~、~~三頁補 JSON-LD~~、~~robots.txt 列名 AI 爬蟲~~ 已完成（2026-08-21，改 `scripts/build_site.py` 重 build，正式站兩頁計算樣式比對確認視覺不變）
2. 上線 analytics（有一個未合併的舊 worktree 分支已加 Cloudflare Web Analytics，確認後合併即可）
3. Bing Webmaster Tools ＋ IndexNow（後台作業）
4. 次要：站內導覽連結改指乾淨網址（現指 `/index.html` 等，308 轉址有接住，不影響索引）

## 漢堡醫美（兩站）

未啟動（使用者指示先不做）。接案開工時跑 `/seo-audit`，照 playbook 現行版做整套。
