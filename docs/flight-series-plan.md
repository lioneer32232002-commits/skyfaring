# 飛行論文導讀系列：排程與進度

一週一篇，共七篇。每週四上午的排程代理（cloud agent）照本檔運作：
從下方佇列挑**第一篇狀態還是 `todo` 的文章**，寫完走 PR，不直接 push main。

## 排程代理的工作流程

1. 讀 `CLAUDE.md` 的寫作風格規範與反面清單，全程遵守。拿不準重新框定骨架時讀 `docs/writing-style-examples.md`。
2. 用 WebFetch 抓該篇的來源論文全文（下方每篇都附開放取用連結），數字與結論以論文原文為準，不可憑印象寫。
3. 文章寫進 `content/posts/`，frontmatter 齊全（`author` 固定 `AI 初稿 / skyfaring 編輯校正`；`highlight` 挑畫面不挑結論）。
4. hero 圖照 CLAUDE.md 配圖流程：從 Unsplash／Pexels／Wikimedia Commons 找免費商用授權圖，curl 下載到 `public/images/`，用 Read 開圖確認內容，不得與已發布文章重複用圖。
5. 發文前跑文章小隊：兩個 subagent 平行審查（格式審查員＋資料查核員），問題修完才算過。另外注意補述句、概括斷言、前後矛盾這三類審查員常漏的問題。
6. 開新分支 `flight-series/<slug>`，commit（訊息繁體中文）、push 分支、開 PR。**不 push main**，由使用者合併後才上線。
7. 同一個 PR 裡把本檔佇列中該篇的狀態從 `todo` 改成 `pr-open`，並填上 PR 編號。
8. 雲端環境沒有 OneDrive junction，`articles/` 存檔一步跳過，由本機 session 在合併後補做。

## 佇列

| # | 週次 | 狀態 | 題目 | 主要來源 |
|---|------|------|------|----------|
| 1 | 2026-08-14 當週 | pr-open（PR #18） | 驚嚇與意外反應（startle & surprise）：驚嚇後認知受損 30–90 秒 | [PMC narrative review](https://pmc.ncbi.nlm.nih.gov/articles/PMC10790839/) |
| 2 | 2026-08-20 當週 | todo | 晴空亂流與氣候變遷：北美與歐洲上空嚴重亂流體積約增一倍 | [Storer & Williams 2017](https://link.springer.com/article/10.1007/s00376-017-6268-2)；[Prosser 2023 GRL](https://agupubs.onlinelibrary.wiley.com/doi/10.1029/2023gl103814) |
| 3 | 2026-08-27 當週 | todo | 自動化與手飛技能退化：全動模擬機下的飛行表現與視覺掃描 | [Causse et al. 2024](https://www.sciencedirect.com/science/article/pii/S0003687024002333)；佐以 Flying the Needles |
| 4 | 2026-09-03 當週 | todo | 超長程航班機師睡眠：組員休息艙裡的實測資料 | [Clocks & Sleep ULR](https://doi.org/10.3390/clockssleep3040036)；[Frontiers ULR 疲勞管理](https://www.frontiersin.org/journals/environmental-health/articles/10.3389/fenvh.2023.1329203/full) |
| 5 | 2026-09-10 當週 | todo | 機師憂鬱與求助障礙：12.6% 達憂鬱門檻、4.1% 曾有自殺念頭 | [Harvard 匿名調查](https://pmc.ncbi.nlm.nih.gov/articles/PMC5157081/)；[德翼後系統性回顧](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5869314/) |
| 6 | 2026-09-17 當週 | todo | 機師與客艙組員的黑色素瘤風險：發生率約一般人兩倍 | [Frontiers 宇宙輻射回顧](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2022.947068/full)；[北大西洋航線機師癌症研究](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5559846/) |
| 7 | 2026-09-24 當週 | todo | 飛行員選才的相對年齡效應：檢驗出生月份理論 | [PMC 相對年齡效應研究](https://www.ncbi.nlm.nih.gov/articles/PMC11422595/) |

七篇寫完後，排程代理不再有 `todo` 項目時，只回報「系列已完結」，不自行加新題目。
