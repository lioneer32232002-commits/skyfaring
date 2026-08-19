---
description: 發文前跑文章小隊審查（格式＋資料），通過才 commit + push 上線
argument-hint: <slug>（要發布的文章 slug）
allowed-tools: Bash, Read, Grep, Glob, Edit, Task
---

把一篇 skyfaring 文章發布上線。這會推到 main，Cloudflare Pages 會自動部署，所以務必先過審查。

目標文章 slug：$ARGUMENTS

照這個流程，當你是「文章隊長」：

1. **確定檔案**：若有給 slug，檔案就是 `content/posts/<slug>.md`；沒給就問使用者要發哪一篇（可用 git status 看剛改過的 .md），不要亂猜。確認檔案存在。

2. **格式審查員**：跑
   `node scripts/check-post.mjs content/posts/<slug>.md`
   - 有任何 **✗ ERROR** → **停止發文**，把清單列給使用者，等修好再來。不要自己順手改別的段落（精準修改，不擴散）。
   - 只有 **! WARN** → 逐項判斷是不是「來源原文真的這樣用」。不確定的列出來問使用者，別自作主張。

3. **資料查核員**：用 Task 工具呼叫 `data-checker` subagent，把文章檔路徑給它，核對數字與來源。
   - 回報 `需修正` → **停止發文**，列出對不上的數據，等修正。
   - 回報 `通過` 或 `無法核對` → 記下結論往下走（無法核對時提醒使用者來源缺失）。

4. **隊長彙整**：兩關都過（或 WARN 已確認可接受）才繼續。任何一關沒過就停在這裡，給出待修清單。

5. **發布**：
   - `git add` 該文章檔，以及它的 hero 圖片（`public/images/...`，若是新圖也一起加）。只 add 這次要發的東西，不要 `git add -A`。
   - commit，訊息用繁體中文描述這篇文章（例如「新增文章：…」）。
   - `git push origin main`。
   - push 成功後 `post-push-archive` hook 會自動把論文導讀類文章複製到 `articles/`，不要再手動 `cp`；hook 回報略過（例如 junction 沒建）時才需要處理。
   - 告訴使用者已推送、Cloudflare Pages 部署中、文章稍後會出現在站上。

全程只動這一篇文章相關的檔案，不擴散到其他已確認的內容。
