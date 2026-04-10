"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getViewCount } from "@/lib/supabase";
import type { PostMeta } from "@/lib/posts";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function ArticleCard({ post }: { post: PostMeta }) {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    getViewCount(`blog/${post.slug}`).then(setViews);
  }, [post.slug]);

  const displayDate = post.updated || post.date;
  const formatted = displayDate
    ? new Date(displayDate).toLocaleDateString("zh-TW", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <Link href={`/blog/${post.slug}/`} className="group block">
      <article className="bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-slate-100 dark:border-slate-700">
        {post.heroImage && (
          <div className="h-48 overflow-hidden">
            <img
              src={`${BASE_PATH}${post.heroImage}`}
              alt={post.heroAlt ?? post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="p-5">
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors leading-snug mb-2">
            {post.title}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-4">
            {post.excerpt}
          </p>
          <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
            <span>{formatted}</span>
            <span>{views !== null ? `${views.toLocaleString()} 次瀏覽` : "—"}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
