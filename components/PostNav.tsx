import ArticleCard from "@/components/ArticleCard";
import ViewCountsProvider from "@/components/ViewCountsProvider";
import type { PostMeta, TocEntry } from "@/lib/posts";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * 文章頁的導覽區塊。除了複用的卡片以外都是伺服端元件，靜態輸出時就算完。
 */

/**
 * 文章目錄。
 *
 * 用原生 <details open> 而不是自己寫展開邏輯：不需要任何用戶端 JS，
 * 也不會有還沒 hydrate 就點不開的空窗。預設展開，手機上想收起就收起。
 *
 * 少於 3 節的文章不顯示——兩行的目錄沒有導覽價值，只是噪音。
 *
 * href 要 encodeURIComponent：id 由 rehype-slug 從中文標題產生，
 * 直接放進 href 的話中文字不是合法的 URL 字元。
 */
export function ArticleToc({ toc }: { toc: TocEntry[] }) {
  if (toc.length < 3) return null;

  return (
    <details
      open
      className="group mb-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60"
    >
      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-between">
        目錄
        <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
          {toc.length} 節
          <span className="ml-2 inline-block transition-transform group-open:rotate-180">▾</span>
        </span>
      </summary>
      <ol className="px-4 pb-4 space-y-1.5">
        {toc.map((h) => (
          <li key={h.id} className={h.level === 3 ? "pl-4" : ""}>
            <a
              href={`#${encodeURIComponent(h.id)}`}
              className={`text-sm hover:text-sky-600 dark:hover:text-sky-400 hover:underline ${
                h.level === 3
                  ? "text-slate-500 dark:text-slate-400"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </details>
  );
}

/** 標題上方的一行系列標示，讓從搜尋直接落地第三篇的讀者知道自己在哪。 */
export function SeriesBadge({
  series,
  index,
  total,
  firstSlug,
}: {
  series: string;
  index: number;
  total: number;
  firstSlug: string;
}) {
  return (
    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
      <a
        href={`${BASE_PATH}/blog/${firstSlug}/`}
        className="text-sky-600 dark:text-sky-400 hover:underline"
      >
        {series}
      </a>
      <span className="mx-1.5 text-slate-300 dark:text-slate-600">·</span>
      第 {index} 篇，共 {total} 篇
    </p>
  );
}

/** 文章末尾的完整系列清單，目前這篇不做成連結並標記出來。 */
export function SeriesNav({
  series,
  posts,
  currentSlug,
}: {
  series: string;
  posts: PostMeta[];
  currentSlug: string;
}) {
  return (
    <nav
      aria-label="系列文章"
      className="mt-10 p-5 rounded-xl border border-sky-200 dark:border-sky-900 bg-sky-50/60 dark:bg-sky-950/40"
    >
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
        {series}
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
        這個系列共 {posts.length} 篇
      </p>
      <ol className="space-y-2">
        {posts.map((p, i) => {
          const current = p.slug === currentSlug;
          return (
            <li key={p.slug} className="flex gap-2.5 text-sm leading-relaxed">
              <span
                className={`shrink-0 tabular-nums ${
                  current
                    ? "text-sky-700 dark:text-sky-300 font-semibold"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {i + 1}.
              </span>
              {current ? (
                <span className="text-slate-700 dark:text-slate-200 font-semibold">
                  {p.title}
                  <span className="ml-2 text-xs font-normal text-sky-700 dark:text-sky-300">
                    （閱讀中）
                  </span>
                </span>
              ) : (
                <a
                  href={`${BASE_PATH}/blog/${p.slug}/`}
                  className="text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 hover:underline"
                >
                  {p.title}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * 上一篇／下一篇。兩邊都可能不存在（系列或分類的頭尾）。
 * bySeries 為 true 時順序來自系列篇次，標註寫「系列」；否則標註分類名。
 */
export function AdjacentNav({
  prev,
  next,
  category,
  bySeries,
}: {
  prev?: PostMeta;
  next?: PostMeta;
  category?: string;
  bySeries?: boolean;
}) {
  if (!prev && !next) return null;

  const scope = bySeries ? "系列" : category;
  const hint = scope ? `（${scope}）` : "";

  const linkClass =
    "group flex flex-col gap-1 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-700 transition-colors";
  const labelClass = "text-xs text-slate-500 dark:text-slate-400";
  const titleClass =
    "text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-sky-600 dark:group-hover:text-sky-400 line-clamp-2";

  return (
    <nav
      aria-label="上一篇與下一篇"
      className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4"
    >
      {prev ? (
        <a href={`${BASE_PATH}/blog/${prev.slug}/`} className={linkClass}>
          <span className={labelClass}>← 上一篇{hint}</span>
          <span className={titleClass}>{prev.title}</span>
        </a>
      ) : (
        <span />
      )}
      {next ? (
        <a href={`${BASE_PATH}/blog/${next.slug}/`} className={`${linkClass} sm:text-right`}>
          <span className={labelClass}>下一篇{hint} →</span>
          <span className={titleClass}>{next.title}</span>
        </a>
      ) : (
        <span />
      )}
    </nav>
  );
}

/** 同分類的相關文章。用既有的卡片元件，視覺跟列表頁一致。 */
export function RelatedPosts({ posts }: { posts: PostMeta[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-12" aria-label="相關文章">
      <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-5">
        相關文章
      </h2>
      <ViewCountsProvider slugs={posts.map((p) => `blog/${p.slug}`)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((p) => (
            <ArticleCard key={p.slug} post={p} />
          ))}
        </div>
      </ViewCountsProvider>
    </section>
  );
}
