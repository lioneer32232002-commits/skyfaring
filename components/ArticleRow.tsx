import Link from "next/link";
import type { PostMeta } from "@/lib/posts";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * 文章列表用的精簡列。
 *
 * 動機：/blog/ 一次排 89 張 ArticleCard，每張帶一張 192px 高的圖，
 * 讀者往下滑其實只在掃標題。前 9 篇維持卡片，第 10 篇起改用這個元件。
 *
 * 這裡刻意不顯示瀏覽次數，也不呼叫 useViewCount：一列一個數字的價值很低，
 * 卻會把整份 counts 的變動綁進 80 個節點。要看數字的人會點進文章頁。
 * 沒有 "use client"，由呼叫端（BlogFilter）決定執行環境。
 */
export default function ArticleRow({ post }: { post: PostMeta }) {
  const displayDate = post.updated || post.date;
  const formatted = displayDate
    ? new Date(displayDate).toLocaleDateString("zh-TW", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      })
    : "";

  // 分類、日期、閱讀時間各自 nowrap，中間的「·」跟著前一項走
  const meta = [post.category, formatted, `${post.readingMinutes} 分鐘`].filter(
    Boolean
  ) as string[];

  return (
    <Link href={`/blog/${post.slug}/`} className="group flex items-center gap-4 py-3">
      <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700">
        {post.heroImage && (
          <img
            src={post.heroThumbs?.src ?? `${BASE_PATH}${post.heroImage}`}
            srcSet={post.heroThumbs?.srcSet || undefined}
            sizes="64px"
            alt=""
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
            style={post.heroPosition ? { objectPosition: post.heroPosition } : undefined}
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors leading-snug line-clamp-2 text-balance">
          {post.title}
        </h3>
        <div className="mt-1 flex flex-wrap gap-x-1.5 text-xs text-slate-500 dark:text-slate-400">
          {meta.map((item, i) => (
            <span key={item} className="whitespace-nowrap">
              {i > 0 && (
                <span className="mr-1.5 text-slate-300 dark:text-slate-600">·</span>
              )}
              {item}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
