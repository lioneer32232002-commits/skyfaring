# 專案呈現重構設計稿（B 分組 ＋ A 精煉圖示）

- 日期：2026-06-25
- 分支：`redesign/project-presentation`
- 狀態：待使用者確認
- 方向：使用者已選定「B 分組 ＋ A 精煉圖示」混合，等權重（不做旗艦大卡）

## 1. 背景與目標

`lib/projects.ts` 目前有 9 個專案，首頁「我的專案」與 `/projects` 頁都用同一種等權重 emoji 卡片平鋪。問題：

- 九個專案同尺寸同權重，沒有層級，旗艦儀表板與 2007 年的舊站看起來一樣重。
- emoji 當主視覺（📊🛩🛰🇺🇦✈⚔📜🏀📚）風格不一致；在使用者自己的 Windows 上多半渲染成黑白，🇺🇦 可能變成「UA」字母，並排像佔位符。這是最大的質感缺口。
- 沒有分組，數量一多就顯雜。
- 手機上首頁專案格線 `grid-cols-1 sm:grid-cols-3` 缺中間步階，九張卡疊成一長條。

目標：把九個專案分成三組、每組一致的線條圖示與留白，並把首頁與 `/projects` 重複的卡片邏輯抽成單一元件。順手修掉同一段程式裡的頁尾連結 bug 與基本無障礙缺口。

## 2. 範圍

**做（本稿）：**
- `lib/projects.ts` 資料模型擴充：加 `group`、`icon` 欄位與分組定義，新增 `resolveProjectHref` 與 `getGroupedProjects` 兩個 helper。
- 新增 `components/ProjectIcon.tsx`（內嵌線條 SVG，零新套件）。
- 新增 `components/ProjectCard.tsx`（full／compact 兩種變體）與 `components/ProjectGroups.tsx`（分組標題＋格線，首頁與 `/projects` 共用）。
- 首頁 `app/page.tsx`、`app/projects/page.tsx` 改用共用元件。
- `app/layout.tsx` 頁尾連結改走 `resolveProjectHref`，修掉 `BASE_PATH` 遺漏的 bug。
- `app/globals.css` 補一條全域 `:focus-visible` 外框（新卡片需要）。
- 新專案圖示補 `aria-hidden`。

**不做（另立計畫，使用者已選下一步＝效能）：**
- 圖片瘦身（sharp prebuild、WebP、srcset）、瀏覽數請求合併、文章 hero LCP／CLS、hero 與內文段落的手機尺寸調整。
- SEO／JSON-LD、OG 舊網域、sitemap 漏列、`layout.tsx` 寫死的 `AdamP` 作者、字重 600 未載入。
- 全站其他 emoji（區塊標題 🗂🧭📰、主題 chip、文章 meta、頁尾 ✉）與 `ArticleCard`／breadcrumb／頁尾的 `slate-400→500` 對比。
- repo 根目錄殘留的亂碼暫存檔清理（git 衛生）。

不做旗艦大卡：九張卡維持等權重。

## 3. 分組與名稱（已確認）

| 組 id | 名稱 | 強調色 | 專案（顯示順序） |
|---|---|---|---|
| `data` | 數據追蹤與分析 | sky | 解放軍擾台動態追蹤、無人機技術情報、烏克蘭無人機戰研究、TPBL Lens |
| `learning` | 航空與歷史學習 | violet | 飛行線上、歷史學院、戰史檔案館 |
| `writing` | 文章與舊站封存 | slate | Skyfaring 文章、舊站文章庫 |

## 4. 資料模型（`lib/projects.ts`）

```ts
export type ProjectGroupId = "data" | "learning" | "writing";

export type ProjectIconName =
  | "radar" | "drone" | "map" | "basketball"
  | "plane" | "school" | "shield" | "news" | "books";

export interface ProjectGroup {
  id: ProjectGroupId;
  label: string;
  accent: "sky" | "violet" | "slate";
}

export const PROJECT_GROUPS: ProjectGroup[] = [
  { id: "data", label: "數據追蹤與分析", accent: "sky" },
  { id: "learning", label: "航空與歷史學習", accent: "violet" },
  { id: "writing", label: "文章與舊站封存", accent: "slate" },
];

export interface Project {
  title: string;
  description: string;
  url: string;
  icon: ProjectIconName;   // 原本是 emoji 字串
  external: boolean;
  introSlug?: string;
  group: ProjectGroupId;   // 新增
}
```

`PROJECTS` 陣列依顯示順序重排（data → learning → writing），每筆 `icon` 由 emoji 改成 icon name、補 `group`。圖示對應：

| 專案 | icon name | Tabler 來源 |
|---|---|---|
| 解放軍擾台動態追蹤 | `radar` | `radar` |
| 無人機技術情報 | `drone` | `drone` |
| 烏克蘭無人機戰研究 | `map` | `map-2` |
| TPBL Lens | `basketball` | `ball-basketball` |
| 飛行線上 | `plane` | `plane-departure` |
| 歷史學院 | `school` | `school` |
| 戰史檔案館 | `shield` | `shield-half` |
| Skyfaring 文章 | `news` | `news` |
| 舊站文章庫 | `books` | `books` |

Helper：

```ts
export function resolveProjectHref(proj: Project): string {
  if (proj.introSlug) return `${BASE_PATH}/projects/${proj.introSlug}/`;
  return proj.url; // 內部 url 已含 BASE_PATH；外部為絕對網址
}

export function projectOpensExternal(proj: Project): boolean {
  return proj.external && !proj.introSlug;
}

export interface GroupedProjects { group: ProjectGroup; projects: Project[]; }

export function getGroupedProjects(): GroupedProjects[] {
  return PROJECT_GROUPS.map((group) => ({
    group,
    projects: PROJECTS.filter((p) => p.group === group.id),
  }));
}
```

`resolveProjectHref` 把 `BASE_PATH` 收斂到單一處，首頁、`/projects`、頁尾全部改用它。

## 5. 圖示元件（`components/ProjectIcon.tsx`）

- 內嵌 SVG，圖示資料取自 Tabler Icons（MIT 授權，於檔頭加授權註記）。
- 統一 `viewBox="0 0 24 24"`、`fill="none"`、`stroke="currentColor"`、`stroke-width="2"`、round cap/join。
- 顏色靠 `currentColor`，亮／暗模式自動跟著父層文字色，零執行成本、不裝新套件。
- 預設 `aria-hidden="true"`（裝飾性，標題文字才是名稱）。

```tsx
const PATHS: Record<ProjectIconName, ReactNode> = {
  radar: (/* tabler radar paths */),
  // ...九個
};

export default function ProjectIcon({ name, className }: {
  name: ProjectIconName;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      className={className} aria-hidden="true">
      {PATHS[name]}
    </svg>
  );
}
```

## 6. 卡片元件（`components/ProjectCard.tsx`）

Props：`{ project: Project; variant?: "full" | "compact"; headingAs?: "h2" | "h3" }`

共用的強調色對應（Tailwind v4 不能動態組類名，必須是完整靜態字串）：

```ts
const ACCENT = {
  sky:    { bar: "bg-sky-400",    iconBg: "bg-sky-50 dark:bg-sky-500/15",     iconText: "text-sky-700 dark:text-sky-300",   dot: "bg-sky-400" },
  violet: { bar: "bg-violet-400", iconBg: "bg-violet-50 dark:bg-violet-500/15", iconText: "text-violet-700 dark:text-violet-300", dot: "bg-violet-400" },
  slate:  { bar: "bg-slate-300 dark:bg-slate-500", iconBg: "bg-slate-100 dark:bg-slate-700", iconText: "text-slate-600 dark:text-slate-300", dot: "bg-slate-400" },
} as const;
```

強調色由 `project.group` 對到 `PROJECT_GROUPS` 的 `accent` 再查表。

**連結**：內部（非 external）用 `next/link`；外部用 `<a target="_blank" rel="noopener noreferrer">`，與既有 `ArticleCard` 的 client 導覽一致（修掉專案卡用裸 `<a>` 的不一致）。href 一律走 `resolveProjectHref`。

**full 變體**（`/projects`，比照樣稿）：
- 外層 `flex gap-3 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group`。
- 第一個子元素是 3px 寬的強調色 bar（`<span className="w-[3px] rounded ...">`，用內部元素而非 `border-left`，保留圓角）。
- 內容：`w-10 h-10 rounded-xl` 圖示色塊（`iconBg`）內含 `ProjectIcon`（`iconText`）→ 標題（`headingAs`，外部加 `aria-hidden` 的 ↗）→ 描述 → 若有 `introSlug` 顯示「看專案導讀 →」。

**compact 變體**（首頁，比照樣稿底部）：
- `flex items-center gap-2 p-3 rounded-xl border ...`，圖示（`iconText`）＋標題 `<span>`（非 heading）。外部加 `aria-hidden` 的 ↗。

hover：陰影 `sm→md`、標題 `group-hover:text-sky-600 dark:group-hover:text-sky-400`。焦點外框由全域 `:focus-visible` 處理。

## 7. 分組容器（`components/ProjectGroups.tsx`）

Props：`{ variant: "full" | "compact"; groupAs: "h2" | "h3" }`

逐組（`getGroupedProjects()`）輸出：
- 組標題：強調色圓點（`ACCENT.dot`）＋ 名稱（`groupAs`）＋一條細分隔線。
- 卡片格線：
  - full：`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`，卡片 `headingAs` 設為比 `groupAs` 低一級。
  - compact：`grid grid-cols-2 sm:grid-cols-3 gap-3`。

標題層級維持單一 h1／正確順序：
- `/projects`：頁面 h1 →（`groupAs="h2"`）→ 卡片標題 h3。
- 首頁：區塊既有 h2「我的專案」→（`groupAs="h3"`）→ compact 卡片用 `<span>`，不產生標題。

## 8. 頁面套用

- `app/page.tsx`：把「我的專案」區塊內的平鋪格線換成 `<ProjectGroups variant="compact" groupAs="h3" />`，保留區塊 h2 與「看所有專案 →」。移除不再需要的 `PROJECTS` import 與內嵌卡片 markup。
- `app/projects/page.tsx`：把格線換成 `<ProjectGroups variant="full" groupAs="h2" />`，保留 h1 與專案數量說明（`PROJECTS.length` 仍可用）。
- `app/layout.tsx` 頁尾：專案連結改走 `resolveProjectHref` 與 `projectOpensExternal`；「專案總覽 →」的 `/projects/` 補上 `BASE_PATH`。維持頁尾原本的純文字連結樣式，不重新設計。

## 9. 手機版

- 首頁 compact：`grid-cols-2`（手機）→ `sm:grid-cols-3`，避免九張卡單欄拖長。
- `/projects` full：`grid-cols-1`（手機）→ `sm:2` → `lg:3`，每組獨立格線，組標題當段落錨點。
- 點擊區：compact 卡片 `p-3`、full 卡片 `p-4`，整張卡可點且高度 ≥ 44px。
- 強調色 bar 與圖示在單欄時版面依然乾淨。

## 10. 無障礙

- `ProjectIcon` 一律 `aria-hidden`；卡片可及名稱來自標題文字。
- 外部連結的 ↗ 補 `aria-hidden`；外部 `<a>` 加可及提示（例如 `aria-label="{title}（在新分頁開啟）"`）。
- `app/globals.css` 新增：`:focus-visible { outline: 2px solid #0284c7; outline-offset: 2px; border-radius: inherit; }`（sky-600 在亮／暗皆可辨識）。

## 11. 驗收標準

- 專案建置（static export）通過、無型別錯誤。
- 首頁顯示三組 compact，`/projects` 顯示三組 full；九個專案落在正確組、順序正確。
- 全部圖示為線條 SVG，無 emoji；每組強調色正確；亮／暗模式皆正常。
- 手機寬度：首頁 compact 兩欄、full 卡片單欄；用 preview 工具截圖佐證手機與深色。
- 鍵盤 Tab 時每個卡片／連結有清楚焦點外框。
- 頁尾專案連結在設了 `NEXT_PUBLIC_BASE_PATH` 時仍正確（不再掉前綴）。

## 12. 風險與決策

- **Tailwind v4 動態類名**：強調色用完整靜態字串對照表，不在 runtime 組字串，避免被 purge。
- **Next 版本差異**（見 `AGENTS.md`）：本稿只動元件、CSS 與資料，Next API 面很小（`next/link`、既有 `generateStaticParams` 不受影響）；若實作時需碰任何 Next 特定行為，先讀 `node_modules/next/dist/docs/`。
- **元件邊界**：`ProjectIcon`（純圖示）、`ProjectCard`（單張卡，兩變體）、`ProjectGroups`（分組與格線）各自單一職責、可獨立理解與測試；資料與 href 邏輯集中在 `lib/projects.ts`。
