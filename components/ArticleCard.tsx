"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getViewCount } from "@/lib/supabase";
import { useViewCount } from "@/components/ViewCountsProvider";
import type { PostMeta } from "@/lib/posts";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function ArticleCard({ post }: { post: PostMeta }) {
  const fromProvider = useViewCount(`blog/${post.slug}`); // number | null | undefined
  const [selfViews, setSelfViews] = useState<number | null>(null);
  const inProvider = fromProvider !== undefined;

  useEffect(() => {
    if (inProvider) return; // 有 Provider 時不自抓，避免 N 次請求
    getViewCount(`blog/${post.slug}`).then(setSelfViews);
  }, [post.slug, inProvider]);

  const views = inProvider ? (fromProvider as number | null) : selfViews;

  const displayDate = post.updated || post.date;
  const formatted = displayDate
    ? new Date(displayDate).toLocaleDateString("zh-TW", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <Link href={`/blog/${post.slug}/`} className="group block h-full">
      <article className="bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-slate-100 dark:border-slate-700 flex flex-col h-full">
        {post.heroImage && (
          <div className="h-48 overflow-hidden shrink-0">
            <img
              src={`${BASE_PATH}${post.heroImage}`}
              alt={post.heroAlt ?? post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="p-5 flex flex-col flex-1">
          <div className="mb-3">
            <span className={`text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 ${post.category ? "" : "invisible"}`}>
              {post.category ?? "　"}
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors leading-snug mb-2 line-clamp-2">
            {post.title}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 flex-1 mb-4">
            {post.excerpt}
          </p>
          <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 mt-auto">
            <span>{formatted}</span>
            <span>{views !== null ? `${views.toLocaleString()} 次瀏覽` : "—"}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
