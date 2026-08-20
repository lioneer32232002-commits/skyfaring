# 飛行論文導讀系列：排程與進度

一週一篇，共七篇。每週四上午的排程代理（cloud agent）照本檔運作：
從下方佇列挑**第一篇狀態還是 `todo` 的文章**，寫完走 PR，不直接 push main。

## 排程代理的工作流程

1. 讀 `CLAUDE.md` 的寫作風格規範與反面清單，全程遵守。拿不準重新框定骨架時讀 `docs/writing-style-examples.md`。
2. 用 WebFetch 抓該篇的來源論文全文（下方每篇都附開放取用連結），數字與結論以論文原文為準，不可憑印象寫。
3. 文章寫進 `content/posts/`，frontmatter 齊全（`author` 固定 `AI 初稿 / skyfaring 編輯校正`；`highlight` 挑畫面不挑結論；`category` 一律填 `航空`，文章頁會據此在文末自動掛 FLIGHT DECK 導流卡）。
4. hero 圖照 CLAUDE.md 配圖流程：從 Unsplash／Pexels／Wikimedia Commons 找免費商用授權圖，curl 下載到 `public/images/`，用 Read 開圖確認內容，不得與已發布文章重複用圖。
5. 發文前跑文章小隊：兩個 subagent 平行審查（格式審查員＋資料查核員），問題修完才算過。另外注意補述句、概括斷言、前後矛盾這三類審查員常漏的問題。
6. 開新分支 `flight-series/<slug>`，commit（訊息繁體中文）、push 分支、開 PR。**不 push main**，由使用者合併後才上線。
7. 同一個 PR 裡把本檔佇列中該篇的狀態從 `todo` 改成 `pr-open`，並填上 PR 編號。
8. 雲端環境沒有 OneDrive junction，`articles/` 存檔一步跳過，由本機 session 在合併後補做。

## 佇列

| # | 週次 | 狀態 | 題目 | 主要來源 |
|---|------|------|------|----------|
| 1 | 2026-08-14 當週 | published（2026-08-14，PR #18） | 驚嚇與意外反應（startle & surprise）：驚嚇後資訊處理受損 30 至 60 秒 | [PMC narrative review](https://pmc.ncbi.nlm.nih.gov/articles/PMC10790839/) |
| 2 | 2026-08-20 當週 | published（2026-08-20，PR #20，本機補寫） | 晴空亂流與氣候變遷：北美與歐洲上空嚴重亂流體積約增一倍 | [Storer & Williams 2017](https://link.springer.com/article/10.1007/s00376-017-6268-2)；[Prosser 2023 GRL](https://agupubs.onlinelibrary.wiley.com/doi/10.1029/2023gl103814) |
| 3 | 2026-08-27 當週 | pr-open（PR #TBD） | 座艙視覺掃描與經驗：手飛落地時機師與新手的眼睛差在哪 | [Lounis, Peysakhovich & Causse 2021, PLoS One](https://pmc.ncbi.nlm.nih.gov/articles/PMC7891757/)（原訂主要來源 Causse et al. 2024 抓不到，改用備援，題目跟著調整） |
| 4 | 2026-09-03 當週 | todo | 超長程航班機師睡眠：組員休息艙裡的實測資料 | [Clocks & Sleep ULR](https://doi.org/10.3390/clockssleep3040036)；[Frontiers ULR 疲勞管理](https://www.frontiersin.org/journals/environmental-health/articles/10.3389/fenvh.2023.1329203/full) |
| 5 | 2026-09-10 當週 | todo | 機師憂鬱與求助障礙：12.6% 達憂鬱門檻、4.1% 曾有自殺念頭 | [Harvard 匿名調查](https://pmc.ncbi.nlm.nih.gov/articles/PMC5157081/)；[德翼後系統性回顧](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5869314/) |
| 6 | 2026-09-17 當週 | todo | 機師與客艙組員的黑色素瘤風險：發生率約一般人兩倍 | [Frontiers 宇宙輻射回顧](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2022.947068/full)；[北大西洋航線機師癌症研究](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5559846/) |
| 7 | 2026-09-24 當週 | todo | 飛行員選才的相對年齡效應：檢驗出生月份理論 | [PMC 相對年齡效應研究](https://www.ncbi.nlm.nih.gov/articles/PMC11422595/) |

七篇寫完後，排程代理不再有 `todo` 項目時，只回報「系列已完結」，不自行加新題目。

## 第 3 篇的備援來源

主要來源 Causse et al. 2024 在 ScienceDirect 上，Elsevier 擋機器人，帶瀏覽器 User-Agent 一樣回 403；
而 OATAO、HAL、Europe PMC、CORE、Semantic Scholar 這些開放取用鏡像被 egress proxy 擋在連線階段。
2026-08-20 試跑就是卡在這裡，經過見 issue #23。

下面兩篇都是開放取用，2026-08-20 從雲端環境實測抓得到全文。主要來源抓不到時改用這兩篇，
不要再開 issue 停擺。寫的時候按這兩篇實際支撐得起的內容走，標題也跟著調整成對應的角度，
不要為了佇列上原訂的題目硬套它們沒講的東西：

- [Friedrich, Lee, Bates, Martin & Faulhaber 2021, Cognition, Technology & Work 23:715–730](https://link.springer.com/content/pdf/10.1007/s10111-020-00663-8.pdf)
  訓練程度如何影響手飛時的飛行表現、掃描型態與工作負荷。
- [Lounis, Peysakhovich & Causse 2021, PLoS One](https://pmc.ncbi.nlm.nih.gov/articles/PMC7891757/)
  座艙視覺掃描如何隨機師經驗改變。與主要來源同為 ISAE-SUPAERO 團隊，用同一台 A320 模擬機。

Springer 的文章頁會 303 轉去 IdP，WebFetch 拿不到內文；改抓 `/content/pdf/<doi>.pdf` 直連就會拿到 PDF。

2026-08-27 那篇實際動手時，Springer 這條路也斷了：`link.springer.com` 的文章頁與 PDF 直連都 303 轉往
`idp.springer.com`，而 `idp.springer.com` 已被 egress proxy 擋在 CONNECT 階段（`403`）；用 curl 帶瀏覽器
User-Agent 直接抓 PDF 只會拿到 Springer 的 bot 挑戰頁（3 KB HTML，不是 PDF）。DLR 的 `elib.dlr.de`、
Crossref、Unpaywall、DOAJ 同樣被 egress proxy 擋掉。所以第 3 篇只用得到 Lounis 2021（PMC 可正常抓全文），
文章就照這一篇能支撐的範圍寫，題目改成座艙視覺掃描與經驗。後續幾篇若碰到 Springer 連結，直接改找 PMC 版本。
