import type { Metadata } from "next";
import { getAllPostMetas } from "@/lib/posts";
import { TOPIC_GROUPS } from "@/lib/taxonomy";
import BlogFilter from "@/components/BlogFilter";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: "文章",
  description: "航空安全報告整理、飛行知識、籃球數據分析、軍事閱讀——Skyfaring 所有文章列表。",
  alternates: { canonical: "/blog/" },
};

export default function BlogPage() {
  const posts = getAllPostMetas();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">文章</h1>
        <p className="text-slate-500 dark:text-slate-400">
          航空安全報告整理、飛行知識與相關研究、籃球數據分析與軍事閱讀，共 {posts.length} 篇。
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-10">
        <span className="text-sm text-slate-400 dark:text-slate-500 mr-1">依主題：</span>
        {TOPIC_GROUPS.map((group) => (
          <a
            key={group.slug}
            href={`${BASE_PATH}/topics/${group.slug}/`}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 hover:border-sky-300 dark:hover:border-sky-700 transition-colors"
          >
            <span>{group.emoji}</span>
            {group.label}
          </a>
        ))}
      </div>

      <BlogFilter posts={posts} />
    </div>
  );
}
