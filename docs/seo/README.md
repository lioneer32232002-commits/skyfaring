# SEO / GEO 制度總覽

> 這個資料夾是所有網站（不只 skyfaring）的搜尋優化知識庫。
> 程式碼各自住在各網站的 repo，但「什麼算做好 SEO」的標準只有這一份。

## 三份檔案的分工

| 檔案 | 是什麼 | 什麼時候動它 |
|---|---|---|
| `playbook.md` | 整套 SEO/GEO 檢查清單（現行版）。新網站要做 SEO 就照這份逐項做 | 只在 `research-log.md` 有新結論時更新，並提高版號 |
| `sites.md` | 各網站對照 playbook 的狀態表：哪項已做、哪項待辦 | 每次對某網站做完 SEO 改動後更新 |
| `research-log.md` | 定期研究的紀錄：日期、查了什麼、結論、有沒有改 playbook | 每次跑 `/seo-refresh` 時追加一節，只增不改 |

## 兩個進入點

- **新網站要做 SEO**（使用者說「幫 X 網站做 SEO」）→ 跑 `/seo-audit <repo路徑>`：
  照 playbook 現行版逐項體檢、產出缺口清單、派工實作、更新 `sites.md`
- **定期更新**（建議每季一次，或使用者說「更新 SEO 研究」）→ 跑 `/seo-refresh`：
  派研究 agent 查最新做法 → 追加 `research-log.md` → 有實質新結論才改 `playbook.md`
  → 對照 `sites.md` 看哪些網站要補做新項目

## 原則

- playbook 每一項都要有來源與日期，沒有佐證的流行做法進 research-log 觀察，不進 playbook
- 派工照 `docs/agents/dispatch.md`：研究與體檢用 sonnet，主 session 只做規劃與驗收
- 各網站的改動在各自 repo commit；本資料夾只記狀態與標準，不放任何網站的程式碼
