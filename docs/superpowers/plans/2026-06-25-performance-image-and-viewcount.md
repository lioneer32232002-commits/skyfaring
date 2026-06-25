# 效能：圖片瘦身＋瀏覽數請求合併 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 兩個獨立但同屬「效能」的工作流。A：把 `public/images/` 的 41MB（56 張，多為原寸相機照）瘦身到長邊 ≤ 1920px、JPEG q82，預期降到 5–8MB，且不動任何引用路徑。B：把同一頁多張 `ArticleCard` 各自打一次 Supabase 的瀏覽數查詢，合併成整頁一次 `.in()` 批次查詢。

**Architecture:**
- **A（圖片）**：新增可重複執行的 Node 腳本 `scripts/slim-images.mjs`（用已在 `node_modules` 的 `sharp`），就地覆寫 `public/images/` 內的點陣圖、保留檔名與副檔名，因此 `heroImage` 等所有引用（frontmatter 與元件 `src`）完全不需改。靜態輸出（`output: "export"` + `images.unoptimized: true`）下，圖片本來就是原樣配送，瘦身來源檔即等於瘦身產物。
- **B（瀏覽數）**：`lib/supabase.ts` 新增 `getViewCounts(slugs)` 一次查多筆；新增 client 元件 `components/ViewCountsProvider.tsx`（React Context），在掛載時批次抓一次，提供 `useViewCounts()`。`ArticleCard` 改為：有 Provider 就讀 context，沒有就退回原本的單筆自抓（向後相容）。三個用到 `ArticleCard` 的位置各包一層 Provider。首頁那顆 `ViewCounter slug="home"` 是寫入（RPC increment），與讀取批次無關，維持不動。

**Tech Stack:** Next 16.2 App Router（static export, `trailingSlash`）、React 19、Tailwind v4、TypeScript、`sharp`（已存在於 node_modules，計畫中補進 devDependencies 以利重現）。無測試框架，驗證以 `npx tsc --noEmit`／`npm run build`／`npm run lint` 與 preview（含 network 面板）為主。

**注意（AGENTS.md）：** 這是 Next 16，與訓練資料可能不同。本計畫 B 只用到既有已驗證的寫法：`next/link`、client component、React Context、以及「server component 把可序列化的 `slugs` 陣列傳給 client component 並用 children 包覆」。這些都是標準 App Router 行為，不碰任何陌生 Next API。若實作中需要動到其他 Next API，先讀 `node_modules/next/dist/docs/`。

**現況量測（2026-06-25，供基準與驗收比對）：**
- `public/images/`：56 張、約 41.4MB。最大數張為原寸相機照：`lioneers-hero.jpg` 5635×3629（5.1MB）、`nba-early-sport-specialization-football.jpg` 5760×3840、`uav-swarm-murmuration-birds.jpg` 6000×4000、`llm-drone-swarm-wot-mcp-lightshow.jpg` 6048×4032。16 張寬度 > 1920px，17 張 > 500KB。
- 瀏覽數請求：首頁精選 6 張卡 → 6 次 `getViewCount` ＋ 1 次 `home` increment ＝ 7 次；`/blog/`（BlogFilter）每張卡一次，全文章時為數十次；`/topics/[group]/` 每張卡一次。

---

## Workstream A — 圖片瘦身

### Task A1: 新增瘦身腳本 `scripts/slim-images.mjs` 與 npm script

**Files:**
- Create: `scripts/slim-images.mjs`
- Modify: `package.json`（加 `scripts.slim-images` 與 `devDependencies.sharp`）

- [ ] **Step 1: 建立腳本**

設計要點：長邊 ≤ `MAX`（1920）才縮小（`withoutEnlargement`），JPEG 用 mozjpeg q82、PNG `compressionLevel 9`、WebP q82；一律去除中繼資料（sharp 預設即去除）；就地覆寫但先寫到暫存檔再 rename，避免讀寫同檔損毀；只在「會變更尺寸」或「檔案 > 150KB」時處理，已很小的圖跳過以利重複執行；最後印出每檔與總計的 before/after。

```js
// scripts/slim-images.mjs
// 就地瘦身 public/images/ 的點陣圖：長邊縮到 <= MAX、重新編碼壓縮。
// 保留檔名與副檔名，所有引用（frontmatter heroImage、元件 src）皆不需改。
// 可重複執行：已達標的小圖會被跳過。
import sharp from "sharp";
import { readdir, stat, rename, unlink } from "node:fs/promises";
import { join, extname } from "node:path";

const DIR = "public/images";
const MAX = 1920;            // 長邊上限（px）
const JPEG_Q = 82;
const WEBP_Q = 82;
const SKIP_UNDER = 150 * 1024; // 已 < 150KB 且尺寸達標就跳過

const fmtKB = (n) => `${Math.round(n / 1024)}KB`;

async function processOne(file) {
  const path = join(DIR, file);
  const ext = extname(file).toLowerCase();
  if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) return null;

  const before = (await stat(path)).size;
  const img = sharp(path, { failOn: "none" });
  const meta = await img.metadata();
  const longest = Math.max(meta.width ?? 0, meta.height ?? 0);
  const needsResize = longest > MAX;

  if (!needsResize && before < SKIP_UNDER) {
    return { file, before, after: before, skipped: true };
  }

  let pipeline = img.rotate(); // 依 EXIF 轉正後再丟棄 EXIF
  if (needsResize) {
    pipeline = pipeline.resize({ width: MAX, height: MAX, fit: "inside", withoutEnlargement: true });
  }
  if (ext === ".png") {
    pipeline = pipeline.png({ compressionLevel: 9, palette: true });
  } else if (ext === ".webp") {
    pipeline = pipeline.webp({ quality: WEBP_Q });
  } else {
    pipeline = pipeline.jpeg({ quality: JPEG_Q, mozjpeg: true });
  }

  const tmp = path + ".tmp";
  await pipeline.toFile(tmp);
  const after = (await stat(tmp)).size;

  // 萬一重新編碼反而變大（已是最佳化的小圖），保留原檔
  if (after >= before && !needsResize) {
    await unlink(tmp);
    return { file, before, after: before, skipped: true };
  }
  await rename(tmp, path);
  return { file, before, after, skipped: false };
}

const files = (await readdir(DIR)).sort();
let tBefore = 0, tAfter = 0, changed = 0;
for (const f of files) {
  const r = await processOne(f);
  if (!r) continue;
  tBefore += r.before;
  tAfter += r.after;
  if (!r.skipped) {
    changed++;
    const pct = Math.round((1 - r.after / r.before) * 100);
    console.log(`✓ ${r.file}  ${fmtKB(r.before)} → ${fmtKB(r.after)}  (-${pct}%)`);
  }
}
console.log("---");
console.log(`processed ${files.length} files, ${changed} re-encoded`);
console.log(`total ${fmtKB(tBefore)} → ${fmtKB(tAfter)}  (-${Math.round((1 - tAfter / tBefore) * 100)}%)`);
```

- [ ] **Step 2: 加 npm script 與 devDependency**

`package.json` 的 `scripts` 加一行：

```json
"slim-images": "node scripts/slim-images.mjs"
```

`devDependencies` 加（`sharp` 目前以傳遞相依存在於 node_modules，明確列出以利重現；版本以實際安裝為準，用 `npm ls sharp` 查到的主版本）：

```json
"sharp": "^0.34.0"
```

裝一下確認鎖定：`npm install`（若 lockfile 變動屬預期）。

- [ ] **Step 3: 不在此任務跑瘦身**（只驗證腳本可載入、語法無誤）

Run: `node --check scripts/slim-images.mjs`
Expected: 無輸出（語法 OK）。實際執行放 Task A2。

- [ ] **Step 4: Commit**

```bash
git add scripts/slim-images.mjs package.json package-lock.json
git commit -m "新增圖片瘦身腳本 slim-images（sharp，長邊 1920／JPEG q82）"
```

---

### Task A2: 執行瘦身並驗證、提交瘦身後圖片

**Files:**
- Modify: `public/images/*`（就地覆寫，檔名不變）

- [ ] **Step 1: 量測基準**

Run: `du -sh public/images && ls public/images | wc -l`
記下瘦身前總大小與張數（預期 ~41MB / 56）。

- [ ] **Step 2: 執行**

Run: `npm run slim-images`
Expected: 逐檔印出縮減百分比，最後總計大幅下降（預期降到 5–8MB 量級）。若某檔報錯（CMYK、損壞），腳本以 `failOn:"none"` 容錯；個別失敗檔列出後手動檢視。

- [ ] **Step 3: 視覺品質抽查（preview）**

啟動 dev server（preview_start）。開首頁確認 hero 背景（`homepage-hero.jpg`）清晰無明顯壓縮痕跡；開一篇含大 hero 的文章（如用到 `lioneers-hero.jpg`、`uav-swarm-murmuration-birds.jpg` 的那幾篇）preview_screenshot 比對。重點看天空漸層、文字疊圖處有無 banding。若 q82 出現可見劣化，把腳本 `JPEG_Q` 調到 85 重跑（先 `git checkout -- public/images` 還原再重跑，避免在已壓過的圖上二次壓縮）。

- [ ] **Step 4: 確認沒有壞引用**

Run: `npm run build`
Expected: 通過（靜態輸出不處理圖片，主要確認沒有意外刪檔或改名）。再 `du -sh public/images` 記錄瘦身後大小。

- [ ] **Step 5: Commit**

```bash
git add public/images
git commit -m "瘦身 public/images：長邊 1920、JPEG q82，總大小 41MB → <size>"
```
（commit message 內 `<size>` 換成 Step 4 量到的實際值。）

---

## Workstream B — 瀏覽數請求合併

### Task B1: `lib/supabase.ts` 新增批次查詢 `getViewCounts`

**Files:**
- Modify: `lib/supabase.ts`（在 `getViewCount` 之後新增函式）

- [ ] **Step 1: 新增函式**

在 `getViewCount`（目前第 11–19 行）之後、`incrementViewCount` 之前插入：

```ts
/** 一次查多個 slug 的瀏覽數，回傳 slug → count 的 map（缺值補 0）。 */
export async function getViewCounts(
  slugs: string[],
): Promise<Record<string, number>> {
  const result: Record<string, number> = {};
  const unique = Array.from(new Set(slugs));
  for (const s of unique) result[s] = 0;
  if (!supabase || unique.length === 0) return result;

  const { data } = await supabase
    .from("page_views")
    .select("slug, count")
    .in("slug", unique);

  for (const row of data ?? []) {
    if (row?.slug != null) result[row.slug] = row.count ?? 0;
  }
  return result;
}
```

- [ ] **Step 2: 型別檢查**

Run: `npx tsc --noEmit`
Expected: 通過（沿用既有 supabase client 與 null 守衛模式）。

- [ ] **Step 3: Commit**

```bash
git add lib/supabase.ts
git commit -m "lib/supabase：新增 getViewCounts 批次查詢"
```

---

### Task B2: 新增 `components/ViewCountsProvider.tsx`

**Files:**
- Create: `components/ViewCountsProvider.tsx`

- [ ] **Step 1: 建立元件（client）**

提供一個 context：掛載時用傳入的 `slugs` 批次抓一次；對外給 `useViewCount(slug)`，回傳 `number | null`（`null` 代表「還沒載入完／不在批次內」，讓 `ArticleCard` 顯示「—」）。不在 Provider 內呼叫時回傳一個「未提供」標記，讓卡片自行 fallback。

```tsx
"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getViewCounts } from "@/lib/supabase";

// undefined = 不在任何 Provider 內（呼叫端自己 fallback 單筆抓）
const ViewCountsContext = createContext<{
  counts: Record<string, number>;
  loaded: boolean;
} | undefined>(undefined);

export default function ViewCountsProvider({
  slugs,
  children,
}: {
  slugs: string[];
  children: ReactNode;
}) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loaded, setLoaded] = useState(false);

  // slugs 以穩定字串當依賴，避免每次 render 的新陣列觸發重抓
  const key = slugs.join("|");
  useEffect(() => {
    let alive = true;
    getViewCounts(slugs).then((c) => {
      if (!alive) return;
      setCounts(c);
      setLoaded(true);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return (
    <ViewCountsContext.Provider value={{ counts, loaded }}>
      {children}
    </ViewCountsContext.Provider>
  );
}

/**
 * 在 Provider 內：回傳該 slug 的 count（未載入完回 null）。
 * 不在 Provider 內：回傳 undefined，呼叫端據此自行單筆抓。
 */
export function useViewCount(slug: string): number | null | undefined {
  const ctx = useContext(ViewCountsContext);
  if (ctx === undefined) return undefined;
  if (!ctx.loaded) return null;
  return ctx.counts[slug] ?? 0;
}
```

- [ ] **Step 2: 型別檢查**

Run: `npx tsc --noEmit`
Expected: 通過（元件尚未被引用）。

- [ ] **Step 3: Commit**

```bash
git add components/ViewCountsProvider.tsx
git commit -m "新增 ViewCountsProvider：整頁批次抓瀏覽數的 context"
```

---

### Task B3: `ArticleCard` 改為優先讀 context，否則 fallback 單筆

**Files:**
- Modify: `components/ArticleCard.tsx`

- [ ] **Step 1: 改資料來源**

把目前的 import 與 state/effect（第 4–5、11–15 行）改成：先問 context；context 存在（`!== undefined`）就用它、且不自抓；不存在才退回原本的 `getViewCount` 單筆自抓。顯示邏輯沿用既有第 52 行（`views !== null` 才顯示數字，否則「—」），與 `null` 表示「未載入」一致。

把第 5 行：
```tsx
import { getViewCount } from "@/lib/supabase";
```
改為：
```tsx
import { getViewCount } from "@/lib/supabase";
import { useViewCount } from "@/components/ViewCountsProvider";
```

把第 10–15 行：
```tsx
export default function ArticleCard({ post }: { post: PostMeta }) {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    getViewCount(`blog/${post.slug}`).then(setViews);
  }, [post.slug]);
```
改為：
```tsx
export default function ArticleCard({ post }: { post: PostMeta }) {
  const fromProvider = useViewCount(`blog/${post.slug}`); // number | null | undefined
  const [selfViews, setSelfViews] = useState<number | null>(null);
  const inProvider = fromProvider !== undefined;

  useEffect(() => {
    if (inProvider) return; // 有 Provider 時不自抓，避免 N 次請求
    getViewCount(`blog/${post.slug}`).then(setSelfViews);
  }, [post.slug, inProvider]);

  const views = inProvider ? (fromProvider as number | null) : selfViews;
```

（第 52 行的 `views !== null ? ... : "—"` 不動。）

- [ ] **Step 2: 型別檢查**

Run: `npx tsc --noEmit`
Expected: 通過。

- [ ] **Step 3: Commit**

```bash
git add components/ArticleCard.tsx
git commit -m "ArticleCard：有 Provider 則讀批次 context，否則退回單筆"
```

---

### Task B4: 三個渲染位置各包一層 Provider

**Files:**
- Modify: `app/page.tsx`、`components/BlogFilter.tsx`、`app/topics/[group]/page.tsx`

- [ ] **Step 1: 首頁精選（`app/page.tsx`）**

新增 import：
```tsx
import ViewCountsProvider from "@/components/ViewCountsProvider";
```
把「最新文章」grid（第 119–123 行的 `<div className="grid ...">{posts.slice(0, 6).map(...)}</div>`）外包 Provider，slugs 用同一批：
```tsx
            <ViewCountsProvider slugs={posts.slice(0, 6).map((p) => `blog/${p.slug}`)}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.slice(0, 6).map((post) => (
                  <ArticleCard key={post.slug} post={post} />
                ))}
              </div>
            </ViewCountsProvider>
```

- [ ] **Step 2: 部落格列表（`components/BlogFilter.tsx`）**

此元件已是 client、且持有全部 `posts`。新增 import，並用「全部文章」的 slugs（非 `filtered`，篩選不該觸發重抓）包住輸出。把 return 的整段（含篩選按鈕與 grid）包進 Provider：

```tsx
import ViewCountsProvider from "@/components/ViewCountsProvider";
```
在 `return (` 後最外層包：
```tsx
    <ViewCountsProvider slugs={posts.map((p) => `blog/${p.slug}`)}>
      {/* 既有的篩選列與 grid 原封不動放這裡 */}
    </ViewCountsProvider>
```
（原本最外層是 `<>...</>`，可把 fragment 換成 Provider，或保留 fragment 包在 Provider 內，二者皆可；擇一即可。）

- [ ] **Step 3: 主題落地頁（`app/topics/[group]/page.tsx`）**

此頁有多個分類 grid（第 145–147 行附近的 `catPosts.map`）。用 `groupPosts`（第 53 行已算出該 group 的全部文章）的 slugs 包住整個分類清單區塊一次即可：

```tsx
import ViewCountsProvider from "@/components/ViewCountsProvider";
```
在輸出多個分類 grid 的最外層容器包：
```tsx
      <ViewCountsProvider slugs={groupPosts.map((p) => `blog/${p.slug}`)}>
        {/* 既有的各分類標題與 grid */}
      </ViewCountsProvider>
```
（若 `groupPosts` 的型別不含 slug，改用該頁實際用來 render 卡片的 posts 陣列推 slugs；以「該頁所有會出現的卡片」為準。）

- [ ] **Step 4: 型別檢查與建置**

Run: `npx tsc --noEmit && npm run build`
Expected: 皆通過。

- [ ] **Step 5: 驗證請求數下降（preview network）**

preview_start 後：
- 開首頁，用 preview_network 篩 `page_views`／`rest/v1` 請求：應只看到「1 次批次讀（`...in.(...)` 帶多個 slug）＋ 1 次 home increment」，而非 7 次。
- 開 `/blog/`：應只有 1 次批次讀（涵蓋全部文章 slug）。切換分類不應再觸發新讀。
- 開任一 `/topics/<group>/`：應只有 1 次批次讀。
- 確認卡片數字正確顯示（與單筆版一致），未載入時為「—」。

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx components/BlogFilter.tsx app/topics/[group]/page.tsx
git commit -m "首頁/部落格/主題頁改用 ViewCountsProvider 批次抓瀏覽數"
```

---

### Task B5: 收尾驗證（全站）

**Files:**
- 無（驗證用）

- [ ] **Step 1: 全量建置與 lint**

Run: `npm run build && npm run lint`
Expected: 皆通過、無新增警告（特別留意 `react-hooks/exhaustive-deps` 已用註解豁免 Provider 的 `slugs` 依賴）。

- [ ] **Step 2: 行為比對**

- 無 Supabase 環境變數時（本機若未設）：`getViewCounts` 回全 0，卡片顯示「—」，頁面不壞（沿用 `e39bde9` 的降級行為）。
- 有環境變數時：數字與舊版單筆一致。
- `ArticleCard` 若被放在沒有 Provider 的新位置，仍會自抓（向後相容）——可在 preview console 確認無錯。

- [ ] **Step 3: 完成**

實作完成後不直接合併。用 superpowers:finishing-a-development-branch 決定 PR 或合回 `main`（push 後 Cloudflare Pages 自動部署）。圖片瘦身與瀏覽數合併可分兩個 PR 或一起，視 reviewer 偏好。

---

## Self-Review

- **Spec coverage：** 兩個使用者選定的效能項都涵蓋——圖片瘦身（A1 腳本＋A2 執行驗證）、瀏覽數請求合併（B1 批次查詢、B2 Provider、B3 卡片改讀、B4 三處套用、B5 驗收）。
- **不改引用面：** 圖片就地覆寫保留檔名／副檔名，`heroImage`、`src`、OG image URL、sitemap 全部不動；A2 的 `npm run build` 即為「沒有壞引用」的守門。
- **向後相容：** `ArticleCard` 在無 Provider 時退回原單筆 `getViewCount`，故 `BlogFilter`、首頁、主題頁以外任何既有或未來用法都不會壞。
- **請求數帳：** 首頁 7 → 2（1 批次讀＋1 increment）、`/blog/` N → 1、`/topics/<group>/` N → 1。`home` 的 increment 是寫入 RPC，刻意不併入讀取批次。
- **降級一致性：** `getViewCounts` 沿用 `supabase === null` 守衛回全 0，與 `e39bde9` 的「環境變數缺失優雅降級」一致；`ViewCounter`／`ArticleCard` 對 0／null 都顯示「—」。
- **idempotency／品質風險：** 瘦身腳本對已達標小圖跳過、重編碼若變大則保留原檔，避免重跑時無謂二次壓縮；q82 視覺風險在 A2 Step 3 以 preview 截圖把關，必要時還原後改 q85 重跑（不在壓過的圖上疊壓）。
- **Next 16 風險：** B 僅用 next/link、client component、React Context、server→client 傳可序列化 props＋children，皆為標準 App Router 行為，未碰陌生 API。
- **Placeholder scan：** 無 TBD；腳本為可執行完整內容；commit message 內 `<size>` 標明需以實測值替換。
