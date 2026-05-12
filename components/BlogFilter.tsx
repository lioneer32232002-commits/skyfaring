"use client";

import { useState } from "react";
import ArticleCard from "@/components/ArticleCard";
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

  const categories = Array.from(
    new Set(posts.map((p) => p.category).filter(Boolean) as string[])
  );

  const filtered = active ? posts.filter((p) => p.category === active) : posts;

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActive(null)}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
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
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              active === cat
                ? `${ACTIVE_BASE} ${CATEGORY_STYLES[cat] ?? "bg-slate-100 text-slate-700 border-slate-300"}`
                : INACTIVE_BASE
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-slate-400">目前還沒有文章。</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((post) => (
            <ArticleCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </>
  );
}
