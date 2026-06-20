import type { Metadata } from "next";
import { getAllPostMetas } from "@/lib/posts";
import { PROJECTS } from "@/lib/projects";
import { TOPIC_GROUPS } from "@/lib/taxonomy";
import ArticleCard from "@/components/ArticleCard";
import ViewCounter from "@/components/ViewCounter";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://skyfaring.pages.dev";

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
  url: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/` : "https://skyfaring.pages.dev/",
  description: "運動數據分析、飛航安全數據分析、詠春拳、歷史與軍事閱讀心得分享。",
  inLanguage: "zh-TW",
};

export default function HomePage() {
  const posts = getAllPostMetas();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero */}
      <section className="relative text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${BASE_PATH}/images/homepage-hero.jpg)` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/92 via-slate-900/75 to-sky-900/80" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-28 relative">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sky-400 font-semibold tracking-widest text-sm uppercase">Skyfaring</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4">
            用數據觀察世界
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl leading-relaxed mb-3">
            從球場到天空，從歷史到當代——用數字和資料說出那些不容易被看見的故事。
          </p>
          <p className="text-slate-400 text-sm max-w-xl leading-relaxed mb-8">
            運動數據分析 · 飛航安全數據分析 · 詠春拳 · 歷史與軍事閱讀心得分享
          </p>
          <div className="text-sm text-slate-400 flex items-center gap-2">
            <span>本站瀏覽次數：</span>
            <ViewCounter slug="home" className="text-sky-300 font-semibold" />
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">

        {/* Projects / Portal */}
        <section className="mb-14">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <span>🗂</span> 我的專案
            </h2>
            <a
              href={`${BASE_PATH}/projects/`}
              className="text-sm text-sky-600 dark:text-sky-400 hover:underline"
            >
              看所有專案 →
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PROJECTS.map((proj) => {
              const href = proj.introSlug
                ? `${BASE_PATH}/projects/${proj.introSlug}/`
                : proj.url;
              const opensExternal = proj.external && !proj.introSlug;
              return (
                <a
                  key={proj.title}
                  href={href}
                  target={opensExternal ? "_blank" : undefined}
                  rel={opensExternal ? "noopener noreferrer" : undefined}
                  className="block p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="text-3xl mb-3">{proj.icon}</div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                    {proj.title}
                    {opensExternal && <span className="ml-1 text-slate-400 text-xs">↗</span>}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {proj.description}
                  </p>
                </a>
              );
            })}
          </div>
        </section>

        {/* Topics */}
        <section className="mb-14">
          <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-5 flex items-center gap-2">
            <span>🧭</span> 依主題瀏覽
          </h2>
          <div className="flex flex-wrap gap-3">
            {TOPIC_GROUPS.map((group) => (
              <a
                key={group.slug}
                href={`${BASE_PATH}/topics/${group.slug}/`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 shadow-sm hover:shadow-md hover:text-sky-600 dark:hover:text-sky-400 transition-all"
              >
                <span>{group.emoji}</span>
                {group.label}
              </a>
            ))}
          </div>
        </section>

        {/* Latest Articles */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <span>📰</span> 最新文章
            </h2>
            <a
              href={`${BASE_PATH}/blog/`}
              className="text-sm text-sky-600 dark:text-sky-400 hover:underline"
            >
              查看全部 →
            </a>
          </div>
          {posts.length === 0 ? (
            <p className="text-slate-400">目前還沒有文章。</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.slice(0, 6).map((post) => (
                <ArticleCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
