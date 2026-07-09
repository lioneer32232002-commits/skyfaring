# 模型調度守則（subagent 派工）

> 讀者：未來在本專案工作的主 session 模型（Sonnet 等級為基準）。
> 原則：派工是為了保護主對話的 context 和取得新鮮視角，不是儀式。
> 本 repo 是 Next.js 部落格＋幾個情報儀表板，多數日常改動（改一篇文章、改一個元件）
> **自己做比派工快**。

## 1. 何時派、何時不派

**不派**（自己直接做）：
- 改 1–3 個已知路徑的檔案（例如修一篇文章的段落、調一個元件的樣式）
- 讀單一檔案的特定段落（Grep 定位＋offset/limit Read）
- 跑驗證指令、看 git 狀態

**派 subagent**（主對話只收結論）：
- **大量讀取**：要看超過 5 個檔案、掃 `content/posts/` 全站文章、`drone-papers/`／
  `basketball-papers/` 論文庫 → Explore 或 general-purpose agent，回報限定「結論＋檔案:行號」
- **事實查核**：文章數字/引述是否與來源論文一致 → 優先重用既有的 `data-checker`
  subagent（`.claude/agents/data-checker.md`），不要重新發明一個
- **網路研究**：找配圖、查授權、查外部報告內容 → general-purpose（可用 WebSearch/WebFetch）
- **批次同型改動**（>10 處，例如整批文章統一某個 frontmatter 欄位）：自己先解出 1 個
  正確範例，再派便宜模型照範例批次套用
- **驗收**：見第 5 節，一律 fresh-context

## 2. 模型選擇

Agent 工具的 `model` 參數目前可選 `haiku` / `sonnet` / `opus`（若環境提供更高階選項，
用法同 opus）。**預設省略 `model`**——繼承 session 模型，多數情況正確。

| 指定 | 用在 |
|---|---|
| `haiku` | 機械性批次：套用已解出的模式、格式轉換、大量檔案的 grep 彙整 |
| `sonnet` | 一般搜尋、一般實作、`data-checker` 之類的查核工作 |
| `opus` | 難判斷：審查、第二意見、sonnet 連錯兩次後的接手、來源互相矛盾的事實查核 |

effort 參數只存在於 Workflow 的 `agent()`（`low`–`max`），Agent 工具沒有；
不要在 Agent 工具的呼叫裡發明 effort 欄位。

## 3. 派工三件套（每個派工 prompt 必含，模板見 templates.md）

1. **目標與動機**：做什麼、為什麼、成品會被拿去做什麼
2. **驗收條件**：可機械檢查的判準（`node scripts/check-post.mjs` 要幾個 ERROR、
   `npm run lint`／`npm run build` 要不要過…）
3. **回報格式**：結論先行；證據用 `檔案路徑:行號`；長產物寫到檔案回傳路徑

## 4. 回報合約

- Subagent **不回貼大段檔案內容**到主對話，只回結論、路徑:行號、與驗收結果
- 產出超過約 30 行的內容 → 落檔（scratchpad 或 docs/），回傳路徑
- 回報裡的每個判斷要標「已驗證」或「推測」，不可混寫

## 5. 驗證不自驗

做的人不驗收自己的工作。宣稱完成前：

- **檔案落地** → 派 fresh-context agent read-back：檔案存在、內容完整、與需求吻合
- **文章改動** → 實跑 `node scripts/check-post.mjs content/posts/<slug>.md`；
  事實類改動另派或重用 `data-checker` 核對來源
- **程式改動**（元件、儀表板、scripts）→ 實跑 `npm run lint` 與 `npm run build`；
  UI 改動另開 preview 實看
- **高風險判斷**（史觀定性、事實正確性、圖片授權）→ 第二意見：另派一個 agent 帶
  「請設法推翻這個結論」的立場複核
- 驗收 agent 必須是**新 context**（不知道實作過程），才驗得出「只有做的人才懂」的問題

## 6. 升降級路徑

- `haiku` 錯 1 次 → 不重試，直接升 `sonnet`
- `sonnet` 同一子任務連錯 2 次 → 帶**完整失敗軌跡**（試了什麼、輸出什麼、卡在哪）升 `opus`
- `opus` 也解不了，或連續兩輪沒有新進展 → 停下來問使用者，附上已嘗試的路徑
- 解出來的模式 → 寫成明確範例，**降級**回 haiku/sonnet 批次套用
- 同一件事最多重試 2 輪；第 3 輪前必須換方法或換路（訊號清單見 judgment.md 第 4 節）

## 7. 本環境的實際限制（誠實標註）

- **沒有 Stop hook 自動 push**（與部分姊妹專案不同）：commit 與 push 都是明確動作，
  正常流程是走 `/publish-post` slash command（`.claude/commands/publish-post.md`）—
  先跑格式審查員（`node scripts/check-post.mjs`）與資料查核員（`data-checker` subagent）
  兩關，全過才 `git push origin main`。**push 到 main 才會觸發 Cloudflare Pages
  自動建置部署**（GitHub 整合直連，`.github/workflows/deploy.yml` 只剩註解、已停用）。
  不要讓 subagent 自行 push；commit/push 集中由主 session 依 `/publish-post` 流程做
- PostToolUse hook（`scripts/hooks/post-write-check.mjs`）只在 Write/Edit 命中
  `content/posts/*.md(x)` 時觸發，且**只回報提醒（additionalContext），不阻擋編輯**，
  跟 ERROR 是否清乾淨要靠人／agent 自己判斷再發文，不是靠 hook 擋
- `reviews/*.html`（情報儀表板頁）疑似由 `scripts/review-dashboard/build_*.py` 產生，
  改動前先看有沒有對應的產生腳本，不要手改看起來是產出的 HTML
  （未逐一確認每個生成物，遇到新的生成物先查明來源腳本，回填本節）
- `automation/`（`SCHEDULES.md`、`runlog-*.jsonl`）是排程觸發紀錄，跟自動發文/儀表板
  更新的排程有關；改動觸發時間類設定前，先看 `runlog` 確認目前實際觸發時間
  （這類設定過去至少改過兩次才穩定，見 judgment.md 第 1 節）
- 平行派工時，多個 agent 同時 Edit 同一檔會互相蓋寫——同檔改動串行做
