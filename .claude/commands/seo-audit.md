# /seo-audit — 幫一個網站做整套 SEO/GEO

用法：`/seo-audit <repo路徑或網站名>`（例如 `/seo-audit D:\repos\eagle-wingchun`）

## 流程（主 session 是隊長，只規劃與驗收，執行派 subagent）

1. 讀 `docs/seo/playbook.md` 現行版與 `docs/seo/sites.md` 裡該網站的既有紀錄（沒有就新增一節）。
2. 派一個 sonnet 審查 agent 對目標 repo 做逐項體檢（只讀不改），對照 playbook 每一項回報
   【有／沒有／部分／不適用】＋檔案:行號證據。報告落檔 scratchpad。
3. 主 session 彙整缺口，按 playbook 的優先級排序，列出待辦清單給使用者確認範圍。
4. 確認後派 sonnet 實作 agent 逐項修（同檔改動串行做），驗收照 `docs/agents/dispatch.md` 第 5 節：
   fresh-context agent read-back ＋ 實跑該 repo 的 lint/build。
5. 更新 `docs/seo/sites.md` 該網站的狀態表（哪項已做、日期、哪項待辦與原因）。
6. commit 由主 session 做：目標 repo 的改動 commit 在目標 repo；sites.md 的更新 commit 在 skyfaring。
   push 前依各 repo 自己的發布流程。

## 硬規則

- subagent 不准 commit/push
- 體檢不憑記憶斷言框架行為，先看該 repo 用的框架版本文件
- 每個判斷標「已驗證」或「推測」
