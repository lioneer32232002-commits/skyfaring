# SEO / GEO 研究紀錄

> 只增不改。每節格式：日期、觸發原因、查核結論、對 playbook 的影響（沒有就寫「無」）。
> 新的一節放最上面。

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
