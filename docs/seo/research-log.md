# SEO / GEO 研究紀錄

> 只增不改。每節格式：日期、觸發原因、查核結論、對 playbook 的影響（沒有就寫「無」）。
> 新的一節放最上面。

## 2026-08-28 — 文章標題與子標題納入 SEO 規範

觸發原因：站主檢視 skyfaring 已發布文章〈boeing-787-za001-test-pilots〉，認為標題偏文學意象、搜尋能見度弱，決定把「標題與子標題照 SEO 設計」訂為全站長期規則（不只這一篇）。

查核結論：本次沒有新的外部研究，是把既有結論套用到下標這一層。

- 依 playbook 第 16 項（arXiv:2603.29979，結構優化引用率 +17.3%）：子標題就是文件架構與資訊分塊的邊界，帶實體詞的子標題同時服務讀者導覽與 AI 切片
- 依第 15 項：這條規則不得演變成關鍵字堆砌，堆砌是實測唯一負效果的手法
- 依第 17 項：只約束新文章與單篇有需要的修改，不批次改寫舊文標題

對 playbook 的影響：新增第 19 項，版本升到 v1.1。skyfaring 的 `CLAUDE.md` 同步新增〈標題與子標題〉節作為寫作端落地。

## 2026-08-21 — 初始建檔

觸發原因：使用者讀到 kuroma.ai 的〈AI 搜尋成效指標〉一文，決定建立跨網站的 SEO/GEO 制度。

查核結論（完整筆記見當次 session scratchpad 的 seo-research.md，關鍵數字已收進 playbook）：

- 【證實】GEO 論文（arxiv 2311.09735）：引語 +42.6%、統計 +32.8%、流暢度 +28.7%、引用來源 +27.7%；關鍵字堆砌 -8.7% 唯一負效果
- 【證實】C-SEO Bench（NeurIPS 2025）：大規模內容改寫策略多數無效甚至負面，與上一條不矛盾（單篇強化有效、批次改寫零和）
- 【證偽】llms.txt 有助搜尋引用：Google 官方 2026-05 指南明講「Google Search ignores them」，OpenAI 搜尋爬蟲也幾乎不抓，只有 Perplexity 相對積極。降為觀察中
- 【證實】AI 爬蟲清單與 robots.txt 建議（OpenAI／Anthropic／Perplexity 官方文件）：搜尋型至少放行 OAI-SearchBot、Claude-SearchBot、PerplexityBot；使用者即時觸發型未必遵守 robots.txt
- 【部分證實】結構化資料：Google 明講不是 AI 引用必要條件，價值在 rich results，兩個理由不可混用
- 【部分證實】Bing Webmaster Tools＋IndexNow 影響 ChatGPT 搜尋能見度（第三方交叉一致，缺官方一手原文，下次覆核）
- 【部分證實】Kuroma 文中「37.2%／62.8% 幽靈提及」是其自家基準研究，且定義（點名不連結）與業界慣用的幽靈引用（連結不點名）相反，引用要小心
- 【證實】Ahrefs：AI Overviews 引用與傳統前十重疊率降到 37.9%（2025-07 約 76%）
- 【查無可靠來源】「結構化內容多被引用 65%」「表格 4.2 倍」「段落 40–75 字最佳」等行銷部落格數字，不採用

對 playbook 的影響：建立 playbook v1；llms.txt 與廠商自報指標列「觀察中」而非必做。
