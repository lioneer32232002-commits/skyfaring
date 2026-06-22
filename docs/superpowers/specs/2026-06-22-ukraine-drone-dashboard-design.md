# 烏克蘭無人機戰研究儀表板 — 設計規格

日期：2026-06-22
狀態：設計定案，待實作

## 目標

在 skyfaring 站新增一個獨立儀表板 `/ukraine-review/`，整理烏克蘭團隊（軍方、政府、學界、產業、志願者）自 2022 年俄烏戰爭全面爆發至今的無人機相關研究與技術發展。

出發點：烏克蘭擁有獨一無二的真實戰場經驗，其無人機「研究」大量存在於學術論文以外（國防部 CIDTD、Brave1、前線創新、公開資料集、產業量產）。因此採**戰場驅動的廣義範圍**，不限同儕審查論文。

## 已確認的關鍵決策

1. **範圍**：戰場驅動的廣義研究（學術論文 + CIDTD/Brave1/軍方/志願者/產業技術發展 + 公開資料集 + 實戰系統）。
2. **放置**：獨立新頁 `/ukraine-review/`，自有生成器；不塞進現有 `/drone-review/`。
3. **深度**：精選策展 ~30–40 項，品質與查證優先於窮盡廣度。
4. **主軸**：能力領域（theme）為主要組織軸；時間線分期為敘事脊椎。

## 與現有 drone dashboard 的差異

- 現有：國別（中國／非中國／台灣）× 月窗口比較。
- 烏克蘭：單一國家 × 自 2022-02 累積的能力演化。
- 故需**新生成器**，不沿用 `build_drone_combined.py` 的國別/月窗口邏輯，只沿用其**視覺語言**（暗色、IBM Plex Mono、Chart.js、角標卡片）與**延伸閱讀比對**邏輯（DOI/arXiv id 對 `content/posts` 的 `source_url`）。

## 組織維度

- **主軸 — 能力領域（theme）**：決定 KPI、領域分布圖、項目表分組。
- **敘事脊椎 — 時間線分期**：一張顯眼的能力演進圖 + 分期發展脈絡敘事。
- **輔助 — 團隊類型（team_type）**：政府/軍方、Brave1/國家平台、學術、產業/新創、志願者/民間。
- **輔助 — 可信度分層（credibility）**：因廣義來源必須誠實標注查證等級。

### 能力領域（約 9 類，實際以蒐集結果微調）

1. FPV 攻擊／遊蕩彈藥
2. 光纖無人機（抗干擾鏈路）
3. 自主與 AI 末端鎖定（機器視覺、抗干擾末端導引）
4. 反無人機與攔截（drone wall、攔截機、drone-on-drone）
5. 電子戰與抗干擾（干擾、欺騙、GPS 拒止下作戰）
6. 海上無人載具 USV（Magura、Sea Baby）
7. 地面無人載具 UGV（後勤、傷患後送、武裝）
8. ISR 與目標管理（偵察、DELTA 戰場感知、火力修正）
9. 深遠程打擊與生產生態系（Liutyi 等長程機、Brave1 量產體系）

### 時間線分期（敘事主線）

- **2022 改裝期**：商規 DJI Mavic、Aerorozvidka 改裝投彈。
- **2023 規模化＋海戰登場**：FPV 量產起步、USV 首次擊沉黑海艦艇（Magura/Sea Baby）。
- **2024 量產＋光纖＋電子戰白熱**：光纖無人機出現、EW 軍備競賽、年產百萬級、Brave1 體系成形。
- **2025–2026 自主化＋無人機對無人機**：AI 末端導引、攔截無人機、drone-on-drone 交戰。

### 可信度分層（credibility tier）

- `peer`：同儕審查／arXiv／會議論文
- `official`：烏克蘭政府/國防部/CIDTD/Brave1 官方
- `media`：信譽媒體／智庫（RUSI、CSIS、IISS、Reuters 等）
- `osint`：開源情報／前線報導

## 頁面區塊（沿用現有視覺語言）

1. 系統列：`觀察中 · LIVE // INTEL · UKRAINE DRONE WAR // SINCE 2022-02 → 2026-06`
2. H1 + 副標
3. KPI：收錄項目、能力領域數、涵蓋年度、團隊類型數、代表系統數、來源數
4. 圖表：
   - 能力演進時間線（重點，分期 × 領域，stacked bar 或 line）
   - 能力領域分布（水平 bar）
   - 團隊類型占比（doughnut）
   - 可信度分層（bar 或 doughnut，誠實標注）
5. 質性分析：
   - 能力判讀（烏克蘭領先什麼、為何戰場驅動重要；小樣本＋既有知識的觀察）
   - 分期發展脈絡（2022 → 2026 演進敘事）
   - 「戰場需求 → 烏克蘭技術回應」對照表（problem → solution，例：GPS 干擾 → 光纖 + 視覺末端導引）
6. 代表性項目表：日期/分期、領域、團隊(類型)、一句話、可信度標籤、來源連結
7. 延伸閱讀：自動連到本站對應導讀（沿用既有 id 比對；現有 CIDTD 低幀率追蹤導讀應被連上）

## 資料模型與技術

### 新檔案

- `scripts/review-dashboard/build_ukraine_intel.py` — 生成器
- `scripts/review-dashboard/ukraine-meta.json` — 策展資料（敘事 + 項目清單）
- `scripts/review-dashboard/publish_ukraine_intel.py` — build → 複製 public → commit + push（事件驅動）
- `public/ukraine-review/index.html` — 部署成品
- `ukraine-papers/*.md` — 同儕審查子集的摘要存檔（符合存檔規範）

### ukraine-meta.json 結構

```json
{
  "topic": "ukraine",
  "window": {"start": "2022-02", "end": "2026-06"},
  "phases": [
    {"key": "2022", "label": "2022 改裝期", "blurb": "..."},
    {"key": "2023", "label": "2023 規模化＋海戰登場", "blurb": "..."},
    {"key": "2024", "label": "2024 量產＋光纖＋電子戰", "blurb": "..."},
    {"key": "2025", "label": "2025–2026 自主化＋無人機對無人機", "blurb": "..."}
  ],
  "narrative": {
    "capability_read": "...",
    "arc": "...",
    "phase_notes": {"2022": "...", "2023": "...", "2024": "...", "2025": "..."}
  },
  "need_response_pairs": [
    {"need": "GPS/無線電干擾", "response": "光纖無人機 + 機器視覺末端導引"}
  ],
  "capability_points": ["...", "..."],
  "items": [
    {
      "id": "magura-v5",
      "date": "2023-08",
      "phase": "2023",
      "theme": "海上無人載具 USV",
      "team": "GUR / 海軍 + 產業",
      "team_type": "政府/軍方",
      "credibility": "official",
      "title": "Magura V5 攻擊型無人水面艇",
      "one_line": "首批擊沉/擊傷黑海艦隊艦艇的攻擊型 USV",
      "source_url": "https://...",
      "representative": true,
      "note": ""
    }
  ]
}
```

註：項目直接寫在 meta（多數非論文檔）。同儕審查項目可另有 `ukraine-papers/*.md`，但儀表板主要讀 meta。

### 生成器要點

- 純讀 `ukraine-meta.json`，無國別/月窗口邏輯。
- pandas（或純 Python）彙整：領域分布、團隊類型占比、可信度分層、分期 × 領域時間線矩陣。
- 沿用 `build_drone_combined.py` 的 `load_articles` / `match_article` 做延伸閱讀比對（用每項的 `source_url`）。
- 沿用其 CSS/Chart.js 樣式常數，保持站內視覺一致。

### git 慣例（沿用 drone 管線）

- 管線檔（`ukraine-meta.json`、`ukraine-papers/`、生成器）維持**未追蹤（本機 only）**。
- 只 commit/push `public/ukraine-review/index.html` 成品。
- 首頁 `app/page.tsx` 的 `PROJECTS` 加卡片（此檔需 commit）。

## 研究蒐集流程（實作階段執行）

ultracode 已開，用 Workflow 多代理：

1. **fan-out**：依 9 個能力領域各派搜尋代理，平行查網（WebSearch + WebFetch）。
2. **抓來源 + 結構化**：每個領域回傳候選項目（含 source_url、宣稱數據）。
3. **對抗式查證**：對易誇大的聲明（擊沉戰果、年產量、首例宣稱）派查證代理，獨立求證、標 credibility，存疑則降級或剔除。
4. **去重 + 彙整**：跨領域去重，挑代表性，湊成 ~30–40 項。
5. **敘事撰寫**：產出 narrative、phase_notes、need_response_pairs、capability_points。

文字風格遵守 CLAUDE.md 寫作規範（無破折號、無感嘆號、中英文間盤古之白等）。

## 部署與維護

- 首頁 `PROJECTS` 卡片導入 `/ukraine-review/`。
- `publish_ukraine_intel.py` 供日後更新；更新為**事件驅動**（有重大進展才跑），非月窗口自動化。

## 範圍邊界（YAGNI）

- 不做 Ukraine vs Russia 全面對比；聚焦烏克蘭自身研究與技術回應，僅在對手適應驅動烏方創新處（如 EW 競賽）帶到。
- 不接入 drone dashboard 的月自動化管線。
- 不在本頁做互動式篩選器（保持與現有儀表板一致的靜態渲染）。
