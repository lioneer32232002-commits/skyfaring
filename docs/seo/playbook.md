# SEO / GEO Playbook

> 現行版：**v1（2026-08-21）**
> 每一項都附來源與查證日期。沒有佐證的做法在最後的「觀察中」，不算必做。
> 新網站要做 SEO 就照本檔逐層做；定期更新走 `/seo-refresh`，改版時提高版號並在 `research-log.md` 記錄原因。

## 版本紀錄

| 版本 | 日期 | 變動 |
|---|---|---|
| v1 | 2026-08-21 | 初版。依 GEO 論文、C-SEO Bench、Google 2026-05 官方 AI 指南、各家爬蟲官方文件建立 |

## 大前提（Google 官方，2026-05）

AI Overviews 與一般搜尋共用同一套索引與品質系統，沒有 AI 專屬索引；為生成式搜尋優化就是為搜尋優化。所以第一層技術基本盤沒有因 AI 搜尋而過時，反而是被 AI 引用的前提。
來源：https://developers.google.com/search/docs/fundamentals/ai-optimization-guide （查證 2026-08-21）

---

## 第一層：技術基本盤（每站必做）

1. **robots.txt**：指向 sitemap；對 AI 爬蟲明確列名而非只靠 `User-agent: *` 預設放行。
   - 要被 AI 搜尋引用，至少放行：`OAI-SearchBot`（ChatGPT 搜尋）、`Claude-SearchBot`、`PerplexityBot`
   - 訓練用爬蟲（`GPTBot`、`ClaudeBot`、`Google-Extended`、`CCBot`、`Bytespider` 等）依站主意願決定擋或放；封鎖 Google-Extended 不影響一般 Google 搜尋
   - `ChatGPT-User`、`Perplexity-User` 這類使用者即時觸發的抓取，官方明講未必遵守 robots.txt，想擋只能靠 WAF，別浪費力氣寫規則
   - 站內範本：flight-deck 的 `robots.txt`（放行搜尋型、封鎖訓練型，每段有註解說明取捨）
   - 來源：OpenAI https://developers.openai.com/api/docs/bots 、Anthropic support 文件（2026-02 更新）、Perplexity docs（查證 2026-08-21）
2. **sitemap.xml**：涵蓋全部可索引頁、每條帶 `lastmod`，由 build 自動產生不手動維護。
3. **逐頁 metadata**：`title`、`meta description`、`canonical` 每頁各自生成，不共用全站同一份。
4. **OG 與 Twitter Card**：`og:title/description/image`（1200×630）＋ `twitter:card=summary_large_image`，每一類頁面都要有，不能只有首頁。
5. **渲染模式**：內容必須存在於靜態 HTML（SSG、或像 flight-deck 那樣替 SPA 另建靜態鏡像頁）。不執行 JS 的爬蟲要抓得到全文，這是被引用的先決條件。
6. **HTML 衛生**：`html lang`（`zh-Hant-TW` 或 `zh-TW`）、每頁唯一 h1、標題階層不跳級、內容圖片有描述性 alt（裝飾圖用 CSS 背景或空 alt）。
7. **網域一致性**：接自訂網域；`*.pages.dev` 與 `www` 301 轉到正式網域；canonical 全站寫死正式網域。站內範本：skyfaring 與 flight-deck 的 `functions/_middleware.js`。
8. **Core Web Vitals**：LCP < 2.5s、INP < 200ms（2024-03 起取代 FID）、CLS < 0.1，用 PageSpeed Insights 或 Search Console 檢查。
9. **日期外顯**：發布與更新日期同時輸出到頁面文字、JSON-LD（`datePublished`/`dateModified`）、sitemap `lastmod`、OG。範本：skyfaring 文章頁。

## 第二層：量測（每站必做）

10. **Google Search Console**：DNS TXT 或 HTML 驗證擇一，兩者並存也可。
11. **Bing Webmaster Tools ＋ IndexNow**：ChatGPT 搜尋用 Bing 索引，沒被 Bing 收錄就進不了 ChatGPT 的搜尋型回答；Bing 2026-02 起有 AI Performance 報告可看內容被 Copilot 引用的頻率。Cloudflare 有原生 IndexNow 支援，成本很低。（此項信心中等，來源為多篇第三方交叉比對，待用 Bing 官方文件覆核，見 research-log 2026-08-21）
12. **站內 analytics**：GA4 或 Cloudflare Web Analytics 至少一種，否則只看得到搜尋端數據、看不到進站後行為，無法驗證 SEO 改動有沒有帶來轉換。

## 第三層：結構化資料（該做，但理由要對）

13. 結構化資料**不是**被 AI 引用的必要條件（Google 官方明講），做它的理由是傳統 rich results 與語意清晰：
    - 內容站：`BlogPosting`／`Article`、`WebSite`、`BreadcrumbList`
    - 在地實體（武術館、診所）：`LocalBusiness` 系（含地址、座標、營業時間、電話）＋ `FAQPage`＋視情況 `Course`。站內範本：eagle-wingchun 的 `build.mjs`（含 `@id` 互相參照的進階做法）
    - 教學內容站：`LearningResource`＋`FAQPage`。站內範本：flight-deck 模組頁
    - 用 `@id` 串節點時，被引用的節點要出現在同一頁，否則 Google 讀到空節點

## 第四層：內容層 GEO（寫內容時遵守，有學術實證）

14. **四個有效手法**（GEO 論文 Table 1，arxiv 2311.09735，KDD 2024）：加入引語（可見度 +42.6%）、加入統計數據（+32.8%）、提升流暢度（+28.7%）、標明引用來源（+27.7%）。skyfaring 的寫作規範本來就要求數字＋出處，方向一致。
15. **一個禁止手法**：關鍵字堆砌是實驗中唯一負效果（-8.7%）。
16. **結構本身有效**（arXiv:2603.29979，2026-03）：清楚的文件架構、資訊分塊（列點、表格）、段落自足（每段獨立可讀、不依賴前文代詞），結構優化讓引用率提升 17.3%。
17. **不做大規模 AI 改寫舊內容**：C-SEO Bench（NeurIPS 2025）結論是多數內容改寫策略無效甚至負面，且具零和性質。單篇新內容照 14–16 寫即可，不回頭批次改寫舊文。
18. **回答真實問題**：潛在讀者會問 AI 的問題（價格、地點、怎麼開始）要在頁面上有直接、機器可讀的答案。範本：eagle-wingchun 的 FAQ。

---

## 觀察中（不列必做，每季 `/seo-refresh` 覆核）

- **llms.txt**：Google 官方 2026-05 明講「Google Search ignores them」；OpenAI 的搜尋爬蟲也幾乎不抓；只有 Perplexity 相對積極。對搜尋引用無實質幫助，別當優先項。例外：若站點內容要給 AI coding assistant／MCP 情境讀（技術文件站），做一份有實用價值，但那是另一種用途。（查證 2026-08-21）
- **廠商自報的 GEO 指標**（提及率、AI 聲量、幽靈提及）：概念可參考，數字多為廠商自家基準（如 Kuroma 的 37.2%），且「幽靈提及」（點名不連結）與業界更常見的「幽靈引用」（連結不點名）定義相反，引用任何此類數字前先確認定義。
- **各平台引用偏好差異**（Profound 6.8 億筆引用研究：ChatGPT 偏好維基百科、Google AI Overviews 與 Perplexity 偏好 Reddit；.com 網域占引用 80.4%）：屬站外佈局層面，暫無行動項。
- **AI Overviews 與傳統前十名重疊率下滑**（Ahrefs：37.9%，2025-07 時約 76%）：意味著光排名好不保證被 AI 引用，內容層（第四層）權重上升。持續觀察。
