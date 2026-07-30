import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleCard from "@/components/ArticleCard";
import ViewCountsProvider from "@/components/ViewCountsProvider";
import { getIndexableTags, getPostsByTag, hasTagPage, tagHref } from "@/lib/tags";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://skyfaring.net";

export function generateStaticParams() {
  // route 參數要用未編碼的值，Next 產生靜態路徑時會自己編碼
  return getIndexableTags().map((tag) => ({ tag }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag: raw } = await params;
  const tag = decodeURIComponent(raw);
  if (!hasTagPage(tag)) return {};

  const count = getPostsByTag(tag).length;
  const description = `Skyfaring 上標記為「${tag}」的文章，共 ${count} 篇。`;

  return {
    title: tag,
    description,
    alternates: { canonical: tagHref(tag) },
    openGraph: {
      type: "website",
      locale: "zh_TW",
      url: `${SITE_URL}${tagHref(tag)}`,
      siteName: "Skyfaring",
      title: tag,
      description,
    },
    twitter: { card: "summary_large_image", title: tag, description },
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag: raw } = await params;
  const tag = decodeURIComponent(raw);
  if (!hasTagPage(tag)) notFound();

  const posts = getPostsByTag(tag);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: tag,
    description: `Skyfaring 上標記為「${tag}」的文章。`,
    url: `${SITE_URL}${tagHref(tag)}`,
    inLanguage: "zh-TW",
    isPartOf: { "@type": "WebSite", name: "Skyfaring", url: `${SITE_URL}/` },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: posts.map((post, i) => ({
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
          <span>{tag}</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          {tag}
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          標記為「{tag}」的文章，共 {posts.length} 篇。
        </p>
      </div>

      <ViewCountsProvider slugs={posts.map((p) => `blog/${p.slug}`)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <ArticleCard key={post.slug} post={post} />
          ))}
        </div>
      </ViewCountsProvider>

      <div className="mt-10">
        <a
          href={`${BASE_PATH}/blog/`}
          className="text-sm text-sky-600 dark:text-sky-400 hover:underline"
        >
          ← 返回文章列表
        </a>
      </div>
    </div>
  );
}
