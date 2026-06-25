# 專案呈現重構 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把首頁與 `/projects` 的九個專案改成三組分類、統一線條 SVG 圖示、抽出共用元件，並修掉頁尾連結 bug 與全域焦點外框。

**Architecture:** 資料與 href 邏輯集中在 `lib/projects.ts`；新增三個職責單一的伺服器元件 `ProjectIcon`（純圖示）、`ProjectCard`（單張卡，full/compact）、`ProjectGroups`（分組標題＋格線）；首頁、`/projects`、頁尾都改用這些共用件。皆為靜態輸出（Next 16 `output: "export"`），圖示在 build 期就被渲染成行內 SVG，無 client 執行成本。

**Tech Stack:** Next 16.2 App Router（static export, `trailingSlash`）、React 19、Tailwind v4、TypeScript。圖示取自 Tabler Icons（MIT）。無測試框架，驗證以 `npx tsc --noEmit`／`npm run build` 與 preview 視覺驗證為主。

**注意（AGENTS.md）：** 這是 Next 16，與訓練資料可能不同。本計畫只用到 `next/link`，且沿用既有 `components/ArticleCard.tsx` 已驗證可行的 `<Link href>` 寫法；若實作中需要動到任何其他 Next API，先讀 `node_modules/next/dist/docs/`。

---

### Task 1: 擴充資料層 `lib/projects.ts`

**Files:**
- Modify: `lib/projects.ts`（整檔替換）

- [ ] **Step 1: 整檔替換為新內容**

```ts
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

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
  icon: ProjectIconName;
  external: boolean;
  /** 若有內部導讀頁，首頁與頁尾連到 /projects/<introSlug>/ 而非直接外連。 */
  introSlug?: string;
  group: ProjectGroupId;
}

/**
 * 全站專案的單一資料來源。
 * 首頁「我的專案」與頁尾「專案」清單都從這裡讀，避免兩處不同步。
 */
export const PROJECTS: Project[] = [
  {
    title: "解放軍擾台動態追蹤",
    description: "中線越線、艦機活動每日數據，含趨勢圖與 SITREP 紀錄。",
    url: "https://pla-tracker.pages.dev/",
    icon: "radar",
    external: true,
    introSlug: "pla-tracker",
    group: "data",
  },
  {
    title: "無人機技術情報",
    description: "中國 vs 非中國 vs 台灣的無人機論文觀察，民用與軍用同頁切換，含領域活躍度與發展脈絡。",
    url: `${BASE_PATH}/drone-review/`,
    icon: "drone",
    external: false,
    group: "data",
  },
  {
    title: "烏克蘭無人機戰研究",
    description: "俄烏戰爭至今烏克蘭團隊的無人機研究與戰場技術演化，依能力領域整理，含演進時間線與來源可信度分層。",
    url: `${BASE_PATH}/ukraine-review/`,
    icon: "map",
    external: false,
    group: "data",
  },
  {
    title: "TPBL Lens",
    description: "台灣職籃 TPBL 數據透鏡，球員與球隊效率分析。",
    url: `${BASE_PATH}/tpbl-lens/`,
    icon: "basketball",
    external: false,
    group: "data",
  },
  {
    title: "飛行線上",
    description: "飛行養成學習系統，飛行訓練與航空教育資源。",
    url: "https://flight-deck-1sr.pages.dev/",
    icon: "plane",
    external: true,
    introSlug: "flight-deck",
    group: "learning",
  },
  {
    title: "歷史學院",
    description: "國中歷史會考線上練習平台，台灣史、中國史、世界史互動題庫與進度追蹤。",
    url: "https://history-academy.pages.dev/",
    icon: "school",
    external: true,
    introSlug: "history-academy",
    group: "learning",
  },
  {
    title: "戰史檔案館",
    description: "用 3D 影像重現歷史戰役，依據權威史料還原關鍵軍事衝突。",
    url: "https://battle-archive.pages.dev/",
    icon: "shield",
    external: true,
    introSlug: "battle-archive",
    group: "learning",
  },
  {
    title: "Skyfaring 文章",
    description: "航空安全、球賽數據、歷史軍事的分析文章",
    url: `${BASE_PATH}/blog/`,
    icon: "news",
    external: false,
    group: "writing",
  },
  {
    title: "舊站文章庫",
    description: "Skyfaring 2007 年起的個人部落格，武術、旅遊、語言、時事。",
    url: "https://yi-tienpan.blogspot.com/",
    icon: "books",
    external: true,
    group: "writing",
  },
];

/** 內部 url 已含 BASE_PATH；有導讀頁時連到內部導讀頁；其餘回傳原 url。 */
export function resolveProjectHref(proj: Project): string {
  if (proj.introSlug) return `${BASE_PATH}/projects/${proj.introSlug}/`;
  return proj.url;
}

/** 真的要在新分頁開外站（有導讀頁的外站不算，會先進內部導讀頁）。 */
export function projectOpensExternal(proj: Project): boolean {
  return proj.external && !proj.introSlug;
}

export interface GroupedProjects {
  group: ProjectGroup;
  projects: Project[];
}

export function getGroupedProjects(): GroupedProjects[] {
  return PROJECT_GROUPS.map((group) => ({
    group,
    projects: PROJECTS.filter((p) => p.group === group.id),
  }));
}
```

- [ ] **Step 2: 型別檢查**

Run: `npx tsc --noEmit`
Expected: 通過（既有的 `app/page.tsx`、`app/projects/page.tsx`、`app/layout.tsx` 仍把 `proj.icon` 當文字 render，型別相容，此時頁面會顯示圖示名稱字串如「radar」，屬預期的中間狀態，後續任務替換）。

- [ ] **Step 3: Commit**

```bash
git add lib/projects.ts
git commit -m "重構 projects 資料層：加 group/icon 欄位與分組 helper"
```

---

### Task 2: 新增 `components/ProjectIcon.tsx`

**Files:**
- Create: `components/ProjectIcon.tsx`

- [ ] **Step 1: 建立元件（圖示路徑取自 Tabler Icons，MIT）**

```tsx
import type { ReactNode } from "react";
import type { ProjectIconName } from "@/lib/projects";

// Icons from Tabler Icons (https://tabler.io/icons) — MIT License.
const PATHS: Record<ProjectIconName, ReactNode> = {
  radar: (
    <>
      <path d="M21 12h-8a1 1 0 1 0 -1 1v8a9 9 0 0 0 9 -9" />
      <path d="M16 9a5 5 0 1 0 -7 7" />
      <path d="M20.486 9a9 9 0 1 0 -11.482 11.495" />
    </>
  ),
  drone: (
    <>
      <path d="M10 10h4v4h-4l0 -4" />
      <path d="M10 10l-3.5 -3.5" />
      <path d="M9.96 6a3.5 3.5 0 1 0 -3.96 3.96" />
      <path d="M14 10l3.5 -3.5" />
      <path d="M18 9.96a3.5 3.5 0 1 0 -3.96 -3.96" />
      <path d="M14 14l3.5 3.5" />
      <path d="M14.04 18a3.5 3.5 0 1 0 3.96 -3.96" />
      <path d="M10 14l-3.5 3.5" />
      <path d="M6 14.04a3.5 3.5 0 1 0 3.96 3.96" />
    </>
  ),
  map: (
    <>
      <path d="M12 18.5l-3 -1.5l-6 3v-13l6 -3l6 3l6 -3v7.5" />
      <path d="M9 4v13" />
      <path d="M15 7v5.5" />
      <path d="M21.121 20.121a3 3 0 1 0 -4.242 0c.418 .419 1.125 1.045 2.121 1.879c1.051 -.89 1.759 -1.516 2.121 -1.879" />
      <path d="M19 18v.01" />
    </>
  ),
  basketball: (
    <>
      <path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
      <path d="M5.65 5.65l12.7 12.7" />
      <path d="M5.65 18.35l12.7 -12.7" />
      <path d="M12 3a9 9 0 0 0 9 9" />
      <path d="M3 12a9 9 0 0 1 9 9" />
    </>
  ),
  plane: (
    <>
      <path d="M14.639 10.258l4.83 -1.294a2 2 0 1 1 1.035 3.863l-14.489 3.883l-4.45 -5.02l2.897 -.776l2.45 1.414l2.897 -.776l-3.743 -6.244l2.898 -.777l5.675 5.727" />
      <path d="M3 21h18" />
    </>
  ),
  school: (
    <>
      <path d="M22 9l-10 -4l-10 4l10 4l10 -4v6" />
      <path d="M6 10.6v5.4a6 3 0 0 0 12 0v-5.4" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3" />
      <path d="M12 3v18" />
    </>
  ),
  news: (
    <>
      <path d="M16 6h3a1 1 0 0 1 1 1v11a2 2 0 0 1 -4 0v-13a1 1 0 0 0 -1 -1h-10a1 1 0 0 0 -1 1v12a3 3 0 0 0 3 3h11" />
      <path d="M8 8l4 0" />
      <path d="M8 12l4 0" />
      <path d="M8 16l4 0" />
    </>
  ),
  books: (
    <>
      <path d="M5 5a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1l0 -14" />
      <path d="M9 5a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1l0 -14" />
      <path d="M5 8h4" />
      <path d="M9 16h4" />
      <path d="M13.803 4.56l2.184 -.53c.562 -.135 1.133 .19 1.282 .732l3.695 13.418a1.02 1.02 0 0 1 -.634 1.219l-.133 .041l-2.184 .53c-.562 .135 -1.133 -.19 -1.282 -.732l-3.695 -13.418a1.02 1.02 0 0 1 .634 -1.219l.133 -.041" />
      <path d="M14 9l4 -1" />
      <path d="M16 16l3.923 -.98" />
    </>
  ),
};

export default function ProjectIcon({
  name,
  className,
}: {
  name: ProjectIconName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}
```

- [ ] **Step 2: 型別檢查**

Run: `npx tsc --noEmit`
Expected: 通過（元件尚未被引用，正常）。

- [ ] **Step 3: Commit**

```bash
git add components/ProjectIcon.tsx
git commit -m "新增 ProjectIcon：內嵌 Tabler 線條圖示元件"
```

---

### Task 3: 新增 `components/ProjectCard.tsx`

**Files:**
- Create: `components/ProjectCard.tsx`

- [ ] **Step 1: 建立元件**

```tsx
import Link from "next/link";
import {
  PROJECT_GROUPS,
  resolveProjectHref,
  projectOpensExternal,
  type Project,
} from "@/lib/projects";
import ProjectIcon from "@/components/ProjectIcon";

const ACCENT = {
  sky: {
    bar: "bg-sky-400",
    iconBg: "bg-sky-50 dark:bg-sky-500/15",
    iconText: "text-sky-700 dark:text-sky-300",
  },
  violet: {
    bar: "bg-violet-400",
    iconBg: "bg-violet-50 dark:bg-violet-500/15",
    iconText: "text-violet-700 dark:text-violet-300",
  },
  slate: {
    bar: "bg-slate-300 dark:bg-slate-500",
    iconBg: "bg-slate-100 dark:bg-slate-700",
    iconText: "text-slate-600 dark:text-slate-300",
  },
} as const;

function accentFor(project: Project) {
  const group = PROJECT_GROUPS.find((g) => g.id === project.group);
  return ACCENT[group?.accent ?? "slate"];
}

export default function ProjectCard({
  project,
  variant = "full",
  headingAs = "h3",
}: {
  project: Project;
  variant?: "full" | "compact";
  headingAs?: "h2" | "h3";
}) {
  const accent = accentFor(project);
  const href = resolveProjectHref(project);
  const external = projectOpensExternal(project);
  const Heading = headingAs;

  const className =
    variant === "compact"
      ? "group flex items-center gap-2 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow"
      : "group flex gap-3 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow";

  const inner =
    variant === "compact" ? (
      <>
        <span className={`inline-flex shrink-0 ${accent.iconText}`}>
          <ProjectIcon name={project.icon} className="w-[18px] h-[18px]" />
        </span>
        <span className="text-sm font-medium text-slate-800 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
          {project.title}
          {external && <span aria-hidden className="ml-0.5 text-slate-400 text-xs">↗</span>}
        </span>
      </>
    ) : (
      <>
        <span className={`w-[3px] shrink-0 rounded ${accent.bar}`} aria-hidden />
        <div className="flex-1">
          <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3 ${accent.iconBg} ${accent.iconText}`}>
            <ProjectIcon name={project.icon} className="w-5 h-5" />
          </span>
          <Heading className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
            {project.title}
            {external && <span aria-hidden className="ml-1 text-slate-400 text-xs">↗</span>}
          </Heading>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            {project.description}
          </p>
          {project.introSlug && (
            <span className="inline-block mt-3 text-xs text-sky-600 dark:text-sky-400">
              看專案導讀 →
            </span>
          )}
        </div>
      </>
    );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${project.title}（在新分頁開啟）`}
        className={className}
      >
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {inner}
    </Link>
  );
}
```

- [ ] **Step 2: 型別檢查**

Run: `npx tsc --noEmit`
Expected: 通過。若 `<Heading>` 動態標籤報型別錯，把宣告改成 `const Heading = headingAs as "h2" | "h3";`。

- [ ] **Step 3: Commit**

```bash
git add components/ProjectCard.tsx
git commit -m "新增 ProjectCard：full/compact 兩種變體的共用專案卡"
```

---

### Task 4: 新增 `components/ProjectGroups.tsx`

**Files:**
- Create: `components/ProjectGroups.tsx`

- [ ] **Step 1: 建立元件**

```tsx
import { getGroupedProjects } from "@/lib/projects";
import ProjectCard from "@/components/ProjectCard";

const DOT: Record<"sky" | "violet" | "slate", string> = {
  sky: "bg-sky-400",
  violet: "bg-violet-400",
  slate: "bg-slate-400",
};

export default function ProjectGroups({
  variant,
  groupAs,
}: {
  variant: "full" | "compact";
  groupAs: "h2" | "h3";
}) {
  const groups = getGroupedProjects();
  const GroupHeading = groupAs;

  const gridClass =
    variant === "compact"
      ? "grid grid-cols-2 sm:grid-cols-3 gap-3"
      : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4";

  return (
    <div className="space-y-10">
      {groups.map(({ group, projects }) => (
        <section key={group.id}>
          <div className="flex items-center gap-2.5 mb-4">
            <span className={`w-2 h-2 rounded-sm shrink-0 ${DOT[group.accent]}`} aria-hidden />
            <GroupHeading className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              {group.label}
            </GroupHeading>
            <span className="flex-1 h-px bg-slate-200 dark:bg-slate-700" aria-hidden />
          </div>
          <div className={gridClass}>
            {projects.map((project) => (
              <ProjectCard
                key={project.title}
                project={project}
                variant={variant}
                headingAs="h3"
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: 型別檢查**

Run: `npx tsc --noEmit`
Expected: 通過。

- [ ] **Step 3: Commit**

```bash
git add components/ProjectGroups.tsx
git commit -m "新增 ProjectGroups：分組標題與格線容器"
```

---

### Task 5: 首頁改用分組（compact）

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: 改 import**

把 `import { PROJECTS } from "@/lib/projects";`（第 3 行）刪除，並新增：

```tsx
import ProjectGroups from "@/components/ProjectGroups";
```

（保留 `getAllPostMetas`、`TOPIC_GROUPS`、`ArticleCard`、`ViewCounter` 等其他 import。）

- [ ] **Step 2: 替換「我的專案」格線**

把「Projects / Portal」區塊裡的這段（目前約第 81–106 行的 `<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">…</div>`，整個 `{PROJECTS.map(...)}` 卡片網格）替換為：

```tsx
          <ProjectGroups variant="compact" groupAs="h3" />
```

保留外層 `<section className="mb-14">`、區塊標題 `<h2>🗂 我的專案</h2>` 與右側「看所有專案 →」連結不動。

- [ ] **Step 3: 型別檢查與建置**

Run: `npx tsc --noEmit && npm run build`
Expected: 皆通過。

- [ ] **Step 4: 視覺驗證（preview）**

啟動 dev server（preview_start），開首頁，用 preview_snapshot 確認「我的專案」出現三組（數據追蹤與分析／航空與歷史學習／文章與舊站封存），每組底下是 compact 卡片、圖示為線條 SVG 而非 emoji。preview_resize 到寬度 375 確認 compact 卡為兩欄。截圖一張存證（preview_screenshot）。

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx
git commit -m "首頁我的專案改用分組精簡卡片"
```

---

### Task 6: `/projects` 改用分組（full）

**Files:**
- Modify: `app/projects/page.tsx`

- [ ] **Step 1: 新增 import**

保留 `import { PROJECTS } from "@/lib/projects";`（第 33 行用到 `PROJECTS.length`），新增：

```tsx
import ProjectGroups from "@/components/ProjectGroups";
```

- [ ] **Step 2: 替換格線**

把目前約第 37–68 行的 `<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">…</div>`（整個 `{PROJECTS.map(...)}` 卡片網格）替換為：

```tsx
      <ProjectGroups variant="full" groupAs="h2" />
```

保留 h1「專案」與其下「共 {PROJECTS.length} 個」說明段不動。

- [ ] **Step 3: 型別檢查與建置**

Run: `npx tsc --noEmit && npm run build`
Expected: 皆通過。

- [ ] **Step 4: 視覺驗證（preview）**

開 `/projects/`，preview_snapshot 確認三組 full 卡片（含描述、有導讀頁者顯示「看專案導讀 →」、外站顯示 ↗）、每組強調色不同（sky/violet/slate 的色條與圖示底色）。preview_resize 到 375 確認 full 卡單欄、768 兩欄。截圖存證。

- [ ] **Step 5: Commit**

```bash
git add app/projects/page.tsx
git commit -m "/projects 改用分組完整卡片"
```

---

### Task 7: 修頁尾連結（BASE_PATH bug）

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: 新增 import**

`PROJECTS` 已 import（第 3 行）。把該行改為同時引入 helper：

```tsx
import { PROJECTS, resolveProjectHref, projectOpensExternal } from "@/lib/projects";
```

- [ ] **Step 2: 頁尾專案清單改走 helper**

把頁尾「Links」區塊裡的 `{PROJECTS.map(...)}`（目前約第 111–127 行）內，逐筆推導 href 的兩行：

```tsx
                    const href = proj.introSlug ? `/projects/${proj.introSlug}/` : proj.url;
                    const opensExternal = proj.external && !proj.introSlug;
```

改為：

```tsx
                    const href = resolveProjectHref(proj);
                    const opensExternal = projectOpensExternal(proj);
```

- [ ] **Step 3: 修「專案總覽 →」遺漏的 BASE_PATH**

把頁尾（目前約第 129 行）：

```tsx
                    <a href="/projects/" className="hover:text-sky-500">專案總覽 →</a>
```

改為：

```tsx
                    <a href={`${BASE_PATH}/projects/`} className="hover:text-sky-500">專案總覽 →</a>
```

（`BASE_PATH` 已於檔案第 6 行定義。）

- [ ] **Step 4: 型別檢查與建置**

Run: `npx tsc --noEmit && npm run build`
Expected: 皆通過。

- [ ] **Step 5: 視覺驗證（preview）**

開任一頁，preview_snapshot 頁尾，確認「專案」清單連結正常、外站帶 ↗。用 preview_eval 抽查頁尾某導讀專案連結的 `href` 屬性，確認為 `/projects/<introSlug>/`（預設 BASE_PATH 為空字串時即此值，已不再因邏輯不同而與頁首不一致）。

- [ ] **Step 6: Commit**

```bash
git add app/layout.tsx
git commit -m "頁尾連結改走 resolveProjectHref，修掉遺漏 BASE_PATH 的 bug"
```

---

### Task 8: 全域 focus-visible 外框

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: 新增規則**

在 `body { … }` 區塊之後（目前約第 19 行後）新增：

```css
:focus-visible {
  outline: 2px solid #0284c7;
  outline-offset: 2px;
  border-radius: inherit;
}
```

- [ ] **Step 2: 建置**

Run: `npm run build`
Expected: 通過。

- [ ] **Step 3: 視覺驗證（preview）**

在首頁用鍵盤 Tab（preview_eval 觸發 focus，或 preview_click 後 Tab），確認專案卡、nav、filter 等 focusable 元素出現清楚的 sky 外框，亮／暗模式皆可見。

- [ ] **Step 4: Commit**

```bash
git add app/globals.css
git commit -m "新增全域 focus-visible 外框（WCAG 2.4.7）"
```

---

### Task 9: 全站收尾驗證

**Files:**
- 無（驗證用）

- [ ] **Step 1: 全量建置與 lint**

Run: `npm run build && npm run lint`
Expected: 皆通過、無新增警告。

- [ ] **Step 2: 跨頁／跨模式驗證**

逐項用 preview 確認並截圖：
- 首頁三組 compact、`/projects` 三組 full，九個專案全部出現且落在正確組。
- 全站無 emoji 專案圖示（皆為線條 SVG），九個圖示各自正確（radar/drone/map/basketball/plane/school/shield/news/books）。
- 手機寬度（375）：首頁 compact 兩欄、`/projects` full 單欄。
- 深色模式：用 preview_eval 模擬 `prefers-color-scheme: dark`（或開深色截圖），確認三組強調色、圖示底色、文字對比皆正常。
- 鍵盤焦點外框可見。

- [ ] **Step 3: 完成**

實作完成後不直接合併。用 superpowers:finishing-a-development-branch 決定要 PR 還是合回 `main`（push 後 Cloudflare Pages 會自動部署）。下一個 workstream 是使用者已選的效能項（圖片瘦身＋瀏覽數請求合併），另立計畫。

---

## Self-Review

- **Spec coverage：** 資料模型（Task 1）、ProjectIcon（2）、ProjectCard full/compact（3）、ProjectGroups（4）、首頁套用（5）、/projects 套用（6）、頁尾 bug（7）、focus-visible（8）、aria-hidden（含於 2/3 的圖示與 ↗）、手機格線步階（5/6 grid 類）、無障礙外部連結 aria-label（3）、驗收（9）皆有對應任務。spec 列為「不做」的效能/SEO/其他 emoji/對比/git 衛生均未納入，與範圍一致。
- **Placeholder scan：** 無 TBD；圖示路徑為實際 Tabler 資料；每個改檔步驟都附完整程式或精確替換。
- **Type consistency：** `ProjectIconName`、`resolveProjectHref`、`projectOpensExternal`、`getGroupedProjects`、`PROJECT_GROUPS`、`ACCENT`/`DOT` 的 key（sky/violet/slate）在各任務間一致；`ProjectCard` props（variant/headingAs）與 `ProjectGroups` 傳入一致。
