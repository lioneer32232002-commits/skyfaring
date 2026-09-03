# /seo-refresh — 定期更新 SEO/GEO 研究

用法：`/seo-refresh`（建議每季跑一次；使用者說「更新 SEO 研究」也走這裡）

## 流程

1. 讀 `docs/seo/playbook.md` 現行版與 `docs/seo/research-log.md` 最近兩節，弄清楚上次查到哪。
2. 派一個 sonnet 研究 agent（general-purpose，可上網）查：
   - playbook 裡標了「觀察中」的項目有沒有新證據
   - AI 爬蟲清單、robots.txt 建議有沒有變動（各家官方文件為準）
   - 過去一季有沒有新的 GEO/SEO 研究（原始論文、Ahrefs/Semrush 等的大樣本分析；
     部落格轉述只當線索，要回溯原始出處）
   - 每個發現標【證實／證偽／查不到來源】＋來源 URL，筆記落檔 scratchpad
3. 主 session 彙整：
   - 在 `research-log.md` 最上面追加一節（日期、查了什麼、結論、對 playbook 的影響）
   - 只有「有原始出處佐證的做法變動」才改 playbook 並提高版號；風潮性做法寫進
     research-log 標「觀察中」
4. playbook 有改版 → 對照 `docs/seo/sites.md`，列出各網站要補做的新項目，
   問使用者要不要現在派工補做。
5. commit：docs/seo/ 的更新由主 session 在 skyfaring commit。

## 硬規則

- research-log 只增不改；playbook 每項都要有來源與日期
- 研究 agent 查不到就寫查不到，禁止推測補完
