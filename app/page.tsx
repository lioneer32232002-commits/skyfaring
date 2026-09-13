import type { Metadata } from "next";
import { getAllPostMetas } from "@/lib/posts";
import {
  getMonthlyCounts,
  getSiteSummary,
  getTopicCounts,
} from "@/lib/siteStats";
import ArticleCard from "@/components/ArticleCard";
import { BarRow, MiniColumns } from "@/components/viz";
import PageHero from "@/components/PageHero";
import ProjectGroups from "@/components/ProjectGroups";
import TopicIcon from "@/components/TopicIcon";
import UiIcon from "@/components/UiIcon";
import ViewCounter from "@/components/ViewCounter";
import ViewCountsProvider from "@/components/ViewCountsProvider";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://skyfaring.net";

export const metadata: Metadata = {
  openGraph: {
    images: [{ url: `${SITE_URL}/images/homepage-hero.jpg`, width: 1200, height: 800, alt: "Skyfaring" }],
  },
  twitter: {
    images: [`${SITE_URL}/images/homepage-hero.jpg`],
  },
};

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Skyfaring",
  url: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/` : "https://skyfaring.net/",
  description: "運動數據分析、飛航安全數據分析、詠春拳、歷史與軍事閱讀心得分享。",
  inLanguage: "zh-TW",
};

/** 把 "2026-09-13" 變成「9/13」；跨年才帶年份（「2025/9/13」）。 */
function formatLatestDate(date: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(date);
  if (!match) return "—";
  const [, y, m, d] = match;
  const sameYear = Number(y) === new Date().getFullYear();
  return `${sameYear ? "" : `${y}/`}${Number(m)}/${Number(d)}`;
}

/**
 * hero 裡的一項站內數字：數字大、單位小，同一基線、整項不換行。
 * unitFirst 給「最近更新 9 月 13 日」這種單位在前的寫法。
 */
function HeroStat({
  value,
  unit,
  href,
  unitFirst = false,
}: {
  value: React.ReactNode;
  unit: string;
  href?: string;
  unitFirst?: boolean;
}) {
  const number = (
    <span className="text-2xl font-semibold text-white tabular-nums leading-none group-hover:text-sky-300 transition-colors">
      {value}
    </span>
  );
  const label = <span className="text-sm text-slate-300">{unit}</span>;
  const inner = (
    <>
      {unitFirst ? label : number}
      {unitFirst ? number : label}
    </>
  );
  const itemClass = "flex items-baseline gap-1.5 whitespace-nowrap";
  return (
    <li>
      {href ? (
        <a href={href} className={`group ${itemClass}`}>
          {inner}
        </a>
      ) : (
        <span className={itemClass}>{inner}</span>
      )}
    </li>
  );
}

export default function HomePage() {
  const posts = getAllPostMetas();
  const summary = getSiteSummary();
  const topicCounts = getTopicCounts();
  const monthly = getMonthlyCounts(6);
  const latest = formatLatestDate(summary.latestDate);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero */}
      <PageHero
        variant="photo"
        image="/images/homepage-hero.jpg"
        eyebrow="Skyfaring"
        title="用數據觀察世界"
        description="從球場到天空，從歷史到當代，用數字和資料說出不容易被看見的故事。"
      >
        {/* 用 flex 排這四項，「·」跟著前一項走，手機折行時不會有單獨一個點或單字掉到下一行 */}
        <div className="text-slate-400 text-sm max-w-xl leading-relaxed mb-8 flex flex-wrap gap-x-3 gap-y-1">
          <span className="whitespace-nowrap">運動數據分析 ·</span>
          <span className="whitespace-nowrap">飛航安全數據分析 ·</span>
          <span className="whitespace-nowrap">詠春拳 ·</span>
          <span className="whitespace-nowrap">歷史與軍事閱讀心得分享</span>
        </div>
        {/*
          站內數字直接排在 hero 裡，一列帶過：數字大、單位緊跟在數字後面同一基線，
          不再另開一個「站內一覽」區塊放四個空框，單位也不會獨自掉到數字底下。
          每一項 nowrap，手機寬度不夠時整項換行。
        */}
        <ul className="flex flex-wrap gap-x-8 gap-y-3 border-t border-white/15 pt-6 mt-2">
          <HeroStat value={summary.posts} unit="篇文章" href={`${BASE_PATH}/blog/`} />
          <HeroStat value={summary.projects} unit="個專案" href={`${BASE_PATH}/projects/`} />
          <HeroStat value={summary.topics} unit="個主題" />
          <HeroStat value={latest} unit="最近更新" unitFirst />
          <HeroStat
            value={<ViewCounter slug="home" total numberOnly />}
            unit="次瀏覽"
          />
        </ul>
      </PageHero>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">

        {/* Projects / Portal */}
        <section className="mb-14">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <UiIcon name="grid" className="w-5 h-5 shrink-0" /> 我的專案
            </h2>
            <a
              href={`${BASE_PATH}/projects/`}
              className="text-sm whitespace-nowrap text-sky-600 dark:text-sky-400 hover:underline"
            >
              看所有專案 →
            </a>
          </div>
          <ProjectGroups variant="compact" groupAs="h3" />
        </section>

        {/* Topics */}
        <section className="mb-14">
          <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-5 flex items-center gap-2">
            <UiIcon name="compass" className="w-5 h-5 shrink-0" /> 依主題瀏覽
          </h2>
          {/* 主題名稱本身就是標籤，長條只負責比大小，所以不需要圖例也不需要座標軸 */}
          <BarRow
            unit="篇"
            items={topicCounts.map((topic) => ({
              label: topic.label,
              value: topic.count,
              href: `/topics/${topic.slug}/`,
              icon: <TopicIcon name={topic.icon} className="w-4 h-4 shrink-0" />,
            }))}
          />
        </section>

        {/* Latest Articles */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <UiIcon name="news" className="w-5 h-5 shrink-0" /> 最新文章
            </h2>
            <a
              href={`${BASE_PATH}/blog/`}
              className="text-sm whitespace-nowrap text-sky-600 dark:text-sky-400 hover:underline"
            >
              查看全部 →
            </a>
          </div>
          {/* 每月發文量。手機上自成一列，不跟標題與「查看全部」擠在同一行 */}
          {monthly.length > 0 && (
            <div className="flex items-end gap-3 mb-6">
              <MiniColumns
                data={monthly.map((m) => ({ label: m.label, value: m.count }))}
                height={40}
                ariaLabel="最近六個月的每月發文篇數"
              />
              <span className="text-xs whitespace-nowrap text-slate-500 dark:text-slate-400 mb-3">
                最近六個月發文
              </span>
            </div>
          )}
          {posts.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400">目前還沒有文章。</p>
          ) : (
            <ViewCountsProvider slugs={posts.slice(0, 6).map((p) => `blog/${p.slug}`)}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.slice(0, 6).map((post) => (
                  <ArticleCard key={post.slug} post={post} />
                ))}
              </div>
            </ViewCountsProvider>
          )}
        </section>
      </div>
    </>
  );
}
