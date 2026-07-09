# 派工 prompt 模板

> 用法：複製對應模板 → 填掉所有 `{…}` → 作為 Agent 工具的 prompt。
> `{…}` 一個都不能留空——填不出「驗收條件」代表你自己還不知道要什麼，先想清楚再派。
> 模型選擇與升降級見 dispatch.md 第 2、6 節。回報合約（結論先行、路徑:行號、
> 長產物落檔）已內建在各模板，別刪。

## 1. 搜尋／定位（Explore 或 general-purpose，通常不指定 model）

```
在 skyfaring repo（工作目錄即根目錄）找出：{要找什麼，例如「所有引用某篇論文的文章」}。
動機：{找到之後要拿來做什麼}。
範圍：{目錄/檔案範圍}。一律排除 node_modules/、.next/、out/（build 產物與相依套件）。
（↑填不出範圍就寫 content/posts/ components/ lib/ 三個目錄；查文章來源另加
drone-papers/ basketball-papers/）
要求：
- 用 Grep/Glob 定位，不要整檔讀大檔（drone-index.csv、shown_papers.md 很長）
- 每個結果給 檔案路徑:行號 ＋ 一行說明它是什麼
回報格式：先一句結論（找到幾處、分佈在哪幾類），然後列表。不要貼大段程式碼。
找不到也是合法答案：說明你搜了哪些 pattern、為何判斷不存在。
```

## 2. 實作（sonnet；被退回兩次升 opus）

```
任務：{做什麼}。動機：{為什麼、成品用在哪}。
背景（已查證，直接採用不必重查）：{相關檔案與行號、既有作法的範例位置}。
本專案硬規則（違反即退回）：
- 文章內文：無破折號（——、—）、無感嘆號、無 AI 腔套語（CLAUDE.md 反面清單）、
  中英文/數字之間要有半形空格（盤古之白）
- frontmatter：`author` 固定為「AI 初稿 / skyfaring 編輯校正」，`slug` 要和檔名一致
- 精準修改，不擴散：只改被指定的段落/檔案，不順手調整其他已確認內容的措辭或格式
- 既有檔用 Edit 別整檔 Write（CRLF）；`reviews/*.html` 等疑似生成物先查來源腳本，
  不手改（見 dispatch.md 第 7 節）
- 不准 commit／push（發文走 `/publish-post`，其餘改動由主 session 統一 commit）
驗收條件（做完自己先跑，任何一項不過就修到過）：
- {指令，例如 node scripts/check-post.mjs content/posts/<slug>.md 零 ERROR}
- {指令，例如 npm run lint / npm run build 通過}
回報格式：改了哪些檔（路徑:行號）、驗收指令的實際輸出、你不確定的點（沒有就寫「無」）。
```

## 3. 重構（先由主 session 解出 1 個範例，再派 haiku/sonnet 批次套用）

```
任務：把 {模式 A} 改成 {模式 B}，共約 {N} 處。
標準範例（已完成、已驗證，照此模式套用）：{檔案:行號 的 before/after 摘錄}。
範圍：{檔案清單或 glob}。範圍外一律不動；遇到長得像但不確定的，跳過並列入回報。
禁止：不改任何行為語意、不動疑似生成物（reviews/*.html、.next/、out/）、
不「順手」修別的問題、不准 commit。
驗收：{npm run lint / npm run build / check-post.mjs 等指令} 全綠；
改動處數量與預估 {N} 差距超過 2 成要說明原因。
回報格式：實際改動處數、跳過清單（路徑:行號＋原因）、驗收輸出。
```

## 4. 研究／事實查核（優先重用 `data-checker` subagent；否則 general-purpose，可上網）

```
問題：{要查證的敘述或要研究的主題}。
用途：{會寫進哪篇文章／影響什麼決定}。
來源紀律：
- 優先核對本地來源：drone-papers/、basketball-papers/（檔名格式
  YYYY-MM-DD-識別碼.md，另有對應 PDF）；找不到本地檔且文章 frontmatter 有
  `source_url` 時才用 WebFetch 取線上來源
- 每個外部 URL 要 WebFetch 實開確認內容存在且說了你引用的話；打不開就換來源或標註
- 圖片授權查核另見 CLAUDE.md「配圖流程」：只能用 Unsplash/Pexels/Pixabay/
  Wikimedia Commons 等免費商用授權圖庫，且要確認攝影師姓名
回報格式：每個查核點一行：【證實／證偽／查不到來源】＋一句依據＋來源路徑或 URL。
查不到就寫查不到，禁止推測補完。超過 30 行的完整筆記落檔到 {路徑}，回傳路徑。
```

## 5. 審查／驗收（fresh-context；高風險用 opus，或 2–3 個獨立審查取多數）

```
你是驗收者，與實作者無關，你的價值在於找出問題，不在於給過。
待驗對象：{檔案清單或 diff 範圍，通常是 content/posts/<slug>.md}。
它宣稱做到：{驗收條件逐條列出}。
逐條驗證：能跑指令就實跑（貼輸出：node scripts/check-post.mjs、npm run lint、
npm run build），能 read-back 就整檔核對，不接受「看起來對」。
另外專門檢查（本專案歷史事故型）：
- frontmatter：author 是否為固定值、必填欄位是否齊全、slug 是否與檔名一致
- 配圖：hero 圖是否為橫式（1200x630 一類比例），不是誤用直式圖
- 數據：文章裡的數字/順序是否與來源一致（例如百分比、投籃數「X 投 Y 中」順序寫反）
- AI 寫作痕跡：對照 CLAUDE.md 反面清單逐項檢查，重新框定骨架要看段落結構不只字面
- 時間/時區類設定：若涉及自動化排程觸發時間，核對 automation/runlog 確認真的生效
回報格式：verdict 先行（通過／退回），退回附「問題＋檔案:行號＋建議修法」。
請帶著「設法推翻它」的立場審，找不到問題也要說明你驗了什麼才敢說沒問題。
```
