"use client";

import { useState } from "react";
import ArticleCard from "@/components/ArticleCard";
import ViewCountsProvider from "@/components/ViewCountsProvider";
import UiIcon from "@/components/UiIcon";
import type { PostMeta } from "@/lib/posts";

const CATEGORY_STYLES: Record<string, string> = {
  攻城獅: "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700",
  籃球研究: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700",
  電腦視覺: "bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 border-violet-300 dark:border-violet-700",
  航空: "bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-700",
  軍事: "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-400 dark:border-slate-500",
  AI: "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700",
};

const ACTIVE_BASE = "border font-semibold";
const INACTIVE_BASE = "border border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200";

export default function BlogFilter({ posts }: { posts: PostMeta[] }) {
  const [active, setActive] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const categories = Array.from(
    new Set(posts.map((p) => p.category).filter(Boolean) as string[])
  );

  /**
   * 站內搜尋。
   *
   * 列表頁本來就把全部文章當 props 拿到手上，所以不需要另外產一份索引檔
   * 或打任何請求，直接在既有資料上濾。比對標題、摘要、tag 與分類，
   * 全部轉小寫讓英文詞不分大小寫；中文沒有大小寫問題，也不需要斷詞，
   * 子字串比對對中文反而剛好。
   */
  const q = query.trim().toLowerCase();
  const filtered = posts.filter((p) => {
    if (active && p.category !== active) return false;
    if (!q) return true;
    const haystack = [p.title, p.excerpt, p.category ?? "", ...p.tags]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });

  return (
    <ViewCountsProvider slugs={posts.map((p) => `blog/${p.slug}`)}>
      <div className="relative mb-5">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
          <UiIcon name="search" className="w-4 h-4" />
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜尋標題、摘要或標籤"
          aria-label="搜尋文章"
          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-400"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActive(null)}
          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
            active === null
              ? "bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold"
              : INACTIVE_BASE
          }`}
        >
          全部
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(active === cat ? null : cat)}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              active === cat
                ? `${ACTIVE_BASE} ${CATEGORY_STYLES[cat] ?? "bg-slate-100 text-slate-700 border-slate-300"}`
                : INACTIVE_BASE
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 有搜尋或分類條件時顯示筆數，讓讀者知道濾掉了多少 */}
      {(q || active) && filtered.length > 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
          符合的文章 {filtered.length} 篇，共 {posts.length} 篇
        </p>
      )}

      {filtered.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400">
          {q ? `找不到符合「${query.trim()}」的文章。` : "目前還沒有文章。"}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((post) => (
            <ArticleCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </ViewCountsProvider>
  );
}
