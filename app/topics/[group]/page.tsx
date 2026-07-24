import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPostMetas } from "@/lib/posts";
import { TOPIC_GROUPS, getGroupBySlug } from "@/lib/taxonomy";
import ArticleCard from "@/components/ArticleCard";
import ViewCountsProvider from "@/components/ViewCountsProvider";
import TopicIcon from "@/components/TopicIcon";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://skyfaring.net";

export function generateStaticParams() {
  return TOPIC_GROUPS.map((group) => ({ group: group.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ group: string }>;
}): Promise<Metadata> {
  const { group: slug } = await params;
  const group = getGroupBySlug(slug);
  if (!group) return {};

  return {
    title: group.label,
    description: group.description,
    alternates: { canonical: `/topics/${group.slug}/` },
    openGraph: {
      type: "website",
      locale: "zh_TW",
      url: `${SITE_URL}/topics/${group.slug}/`,
      siteName: "Skyfaring",
      title: group.label,
      description: group.description,
    },
    twitter: {
      card: "summary_large_image",
      title: group.label,
      description: group.description,
    },
  };
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ group: string }>;
}) {
  const { group: slug } = await params;
  const group = getGroupBySlug(slug);
  if (!group) notFound();

  const posts = getAllPostMetas();
  const groupPosts = posts.filter(
    (p) => p.category && group.categories.includes(p.category)
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: group.label,
    description: group.description,
    url: `${SITE_URL}/topics/${group.slug}/`,
    inLanguage: "zh-TW",
    isPartOf: { "@type": "WebSite", name: "Skyfaring", url: `${SITE_URL}/` },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: groupPosts.map((post, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/blog/${post.slug}/`,
        name: post.title,
      })),
    },
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <div className="mb-8">
        <div className="text-sm text-slate-500 dark:text-slate-400 mb-3">
          <a href={`${BASE_PATH}/`} className="hover:text-sky-500">
            首頁
          </a>
          <span className="mx-1.5">/</span>
          <a href={`${BASE_PATH}/blog/`} className="hover:text-sky-500">
            文章
          </a>
          <span className="mx-1.5">/</span>
          <span className="text-slate-500 dark:text-slate-400">{group.label}</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
          <TopicIcon name={group.icon} className="w-7 h-7 shrink-0 text-sky-600 dark:text-sky-400" />
          {group.label}
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          {group.description}　共 {groupPosts.length} 篇。
        </p>
      </div>

      {/* Other topics */}
      <div className="flex flex-wrap gap-2 mb-10">
        {TOPIC_GROUPS.map((g) => {
          const active = g.slug === group.slug;
          return (
            <a
              key={g.slug}
              href={`${BASE_PATH}/topics/${g.slug}/`}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                active
                  ? "bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold"
                  : "border border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              {g.label}
            </a>
          );
        })}
        <a
          href={`${BASE_PATH}/blog/`}
          className="px-3 py-1 rounded-full text-sm border border-transparent text-sky-600 dark:text-sky-400 hover:underline"
        >
          全部文章 →
        </a>
      </div>

      {/* Posts grouped by sub-category */}
      <ViewCountsProvider slugs={groupPosts.map((p) => `blog/${p.slug}`)}>
      {groupPosts.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400">這個主題目前還沒有文章。</p>
      ) : (
        group.categories.map((cat) => {
          const catPosts = posts.filter((p) => p.category === cat);
          if (catPosts.length === 0) return null;
          return (
            <section key={cat} className="mb-12">
              <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-5 flex items-center gap-2">
                {cat}
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                  {catPosts.length} 篇
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {catPosts.map((post) => (
                  <ArticleCard key={post.slug} post={post} />
                ))}
              </div>
            </section>
          );
        })
      )}
      </ViewCountsProvider>
    </div>
  );
}
