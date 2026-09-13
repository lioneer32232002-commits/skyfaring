# 版型規則

2026-09 三次版型演進（commit 6108855、305ba0e，與本次的頁首統一）定下來的規則。
之後改版面照這幾條走，不要另立一套。

## 換行三原則

寫在 `app/globals.css` 的註解裡，那份是正本，這裡只提要點。

1. 短標籤 nowrap：pill、按鈕、麵包屑每一節、日期、「N 篇」「N 分鐘」這類短字串加 `whitespace-nowrap`。
2. 標題 balance：`h1` 到 `h4` 用 `text-balance`。
3. 段落 pretty：`p` 與 `li` 用 `text-pretty`。

驗收用 `node scripts/check-layout.mjs`（要用 PowerShell 跑），ERROR 必須是 0。

## 卡片語言

一種卡片：`rounded-xl`、`shadow-sm`、`border border-slate-200 dark:border-slate-700`、
底色 `bg-white dark:bg-slate-800`、內距 `p-5`。不加漸層、不加彩色邊框、不加陰影層級變化，
hover 只到 `shadow-md`。清單性質的內容改用 `divide-y` 的列，不要為了整齊硬做成卡。

## 圖表

`components/viz/` 的四個元件（`StatTile`／`StatRow`、`BarRow`、`MiniColumns`、`CadenceStrip`）。
單一色相 sky，其餘中性 slate；每個項目自帶文字標籤與數值，所以沒有圖例、沒有座標軸；
文字一律 slate，顏色只出現在長條與方點上。細節見 `components/viz/README.md`。

## 頁首：PageHero 三變體

全站頁首只有 `components/PageHero.tsx` 一種，三個變體對應三種頁面份量：

| 變體 | 用在哪 | 外觀 | 內距 |
| --- | --- | --- | --- |
| `photo` | 首頁、TPBL Lens | 背景照片加深色漸層，白字，有 eyebrow | `py-14 sm:py-24` |
| `accent` | 專案導讀頁 `/projects/[slug]/` | 群組色淡漸層、色塊圖示、底邊線 | `py-10 sm:py-16` |
| `plain` | 文章、專案總覽、主題、關於 | 白底加底邊線 | `py-8 sm:py-12` |

內距刻度就是這三級：照片頁最厚、導讀頁中等、清單頁最薄，讀者從留白就分得出這頁的份量。
`children` 放描述下方的東西（統計列、CTA、錨點連結、瀏覽次數），`breadcrumb` 放最上面。
內容寬預設 `max-w-5xl`，下方內容區是 `max-w-4xl` 的頁面要傳 `width="4xl"`，否則桌機上會差 64px 沒對齊。

## 列表的重量

同一份清單超過十來筆就不要整批用圖卡。`/blog/` 的做法是前 9 篇 `ArticleCard`，
第 10 篇起換 `components/ArticleRow.tsx`（64×64 縮圖加標題加一行 meta），
有搜尋或分類條件時整批用列。列不顯示瀏覽次數，`ViewCountsProvider` 只抓那 9 篇要用的數字。
