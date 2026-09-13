import type { Metadata } from "next";
import { getAllPostMetas } from "@/lib/posts";
import { getTopicCounts } from "@/lib/siteStats";
import BlogFilter from "@/components/BlogFilter";
import PageHero from "@/components/PageHero";
import TopicIcon from "@/components/TopicIcon";
import { BarRow } from "@/components/viz";

export const metadata: Metadata = {
  title: "文章",
  description: "航空安全報告整理、飛行知識、籃球數據分析、軍事閱讀——Skyfaring 所有文章列表。",
  alternates: { canonical: "/blog/" },
};

export default function BlogPage() {
  const posts = getAllPostMetas();
  const topicCounts = getTopicCounts();

  return (
    <>
      <PageHero
        variant="plain"
        title="文章"
        description={
          <>
            航空安全報告整理、飛行知識與相關研究、籃球數據分析與軍事閱讀，
            <span className="whitespace-nowrap">共 {posts.length} 篇。</span>
          </>
        }
      >
        {/* 依主題的篇數，點標籤進主題頁。長條只比大小，數值直接標在右邊 */}
        <h2 className="text-sm whitespace-nowrap text-slate-500 dark:text-slate-400 mb-3">依主題</h2>
        <BarRow
          unit="篇"
          items={topicCounts.map((topic) => ({
            label: topic.label,
            value: topic.count,
            href: `/topics/${topic.slug}/`,
            icon: <TopicIcon name={topic.icon} className="w-4 h-4 shrink-0" />,
          }))}
        />
      </PageHero>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <BlogFilter posts={posts} />
      </div>
    </>
  );
}
