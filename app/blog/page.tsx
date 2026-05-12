import type { Metadata } from "next";
import { getAllPostMetas } from "@/lib/posts";
import BlogFilter from "@/components/BlogFilter";

export const metadata: Metadata = {
  title: "文章",
  description: "航空安全報告整理、飛行知識、籃球數據分析、軍事閱讀——Skyfaring 所有文章列表。",
  alternates: { canonical: "/blog/" },
};

export default function BlogPage() {
  const posts = getAllPostMetas();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">文章</h1>
        <p className="text-slate-500 dark:text-slate-400">
          航空安全報告整理、飛行知識與相關研究、籃球數據分析與軍事閱讀，共 {posts.length} 篇。
        </p>
      </div>

      <BlogFilter posts={posts} />
    </div>
  );
}
