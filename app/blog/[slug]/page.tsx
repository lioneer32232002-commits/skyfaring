import { getAllSlugs, getPost, addPanguText } from "@/lib/posts";
import ViewCounter from "@/components/ViewCounter";
import UiIcon from "@/components/UiIcon";
import { getSeriesPosts, getRelatedPosts, getAdjacentPosts } from "@/lib/related";
import { SeriesBadge, SeriesNav, AdjacentNav, RelatedPosts } from "@/components/PostNav";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://skyfaring.net";
const DEFAULT_OG = `${SITE_URL}/images/og-default.png`;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  const ogImage = post.heroImage
    ? `${SITE_URL}${post.heroImage}`
    : DEFAULT_OG;

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${slug}/` },
    openGraph: {
      type: "article",
      locale: "zh_TW",
      url: `${SITE_URL}/blog/${slug}/`,
      siteName: "Skyfaring",
      title: post.title,
      description: post.excerpt,
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.heroAlt ?? post.title }],
      publishedTime: post.date,
      modifiedTime: post.updated || post.date,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [ogImage],
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  // 站內動線：系列導覽、同分類前後篇、同分類相關文章。全部在 build 時算好。
  const seriesPosts = post.series ? getSeriesPosts(post.series) : [];
  const seriesIndex = seriesPosts.findIndex((p) => p.slug === slug) + 1;
  const relatedPosts = getRelatedPosts(post);
  const { prev, next, bySeries } = getAdjacentPosts(post);

  const displayDate = post.updated || post.date;
  const formattedDate = displayDate
    ? new Date(displayDate).toLocaleDateString("zh-TW", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const originalDate =
    post.date && post.date !== post.updated
      ? new Date(post.date).toLocaleDateString("zh-TW", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.updated || post.date,
    author: { "@type": "Person", name: post.author },
    publisher: {
      "@type": "Organization",
      name: "Skyfaring",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/images/og-default.png`,
        width: 1200,
        height: 630,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${slug}/`,
    },
    url: `${SITE_URL}/blog/${slug}/`,
    ...(post.tags.length > 0 && { keywords: post.tags.join(", ") }),
    ...(post.category && { articleSection: post.category }),
    ...(post.heroImage && {
      image: { "@type": "ImageObject", url: `${SITE_URL}${post.heroImage}` },
    }),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "首頁", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "文章", item: `${SITE_URL}/blog/` },
      { "@type": "ListItem", position: 3, name: post.title, item: `${SITE_URL}/blog/${slug}/` },
    ],
  };

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/*
        HERO image
        這張是本頁的 LCP 元素，所以不 lazy、給高優先權。
        srcset 把縮圖和原檔擺在一起讓瀏覽器自己挑：手機只有 375px 的版位，
        800w 的 webp 就夠；桌機版位 768px、算上 2 倍點密度才需要原檔。
        width/height 用原圖尺寸，讓版位在圖到之前就留好。
      */}
      {post.heroImage && (
        <figure className="mb-8 -mx-4 sm:mx-0 sm:rounded-2xl overflow-hidden">
          <img
            src={`${BASE_PATH}${post.heroImage}`}
            alt={post.heroAlt ?? post.title}
            className="w-full max-w-full object-cover"
            style={{ maxHeight: "400px", ...(post.heroPosition ? { objectPosition: post.heroPosition } : {}) }}
            srcSet={
              post.heroThumbs?.srcSet
                ? `${post.heroThumbs.srcSet}, ${BASE_PATH}${post.heroImage} ${post.heroThumbs.width}w`
                : undefined
            }
            sizes="(min-width: 768px) 768px, 100vw"
            width={post.heroThumbs?.width || undefined}
            height={post.heroThumbs?.height || undefined}
            fetchPriority="high"
            decoding="async"
          />
          {post.heroCredit && (
            <figcaption className="text-xs text-slate-500 dark:text-slate-400 text-right mt-1 px-2">
              圖片：
              {post.heroCreditUrl ? (
                <a href={post.heroCreditUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-sky-500">
                  {post.heroCredit}
                </a>
              ) : (
                post.heroCredit
              )}
            </figcaption>
          )}
        </figure>
      )}

      {/* 系列標示：從搜尋直接落地中間某篇的讀者需要知道自己在系列的哪個位置 */}
      {post.series && seriesPosts.length > 1 && (
        <SeriesBadge
          series={post.series}
          index={seriesIndex}
          total={seriesPosts.length}
          firstSlug={seriesPosts[0].slug}
        />
      )}

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 px-2.5 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-slate-100 leading-tight mb-6">
        {post.title}
      </h1>

      {/* Highlight */}
      {post.highlight && (
        <blockquote className="mb-6 pl-4 border-l-4 border-sky-400 bg-sky-50 dark:bg-sky-950 dark:border-sky-500 py-3 pr-4 rounded-r-lg text-slate-700 dark:text-slate-300 text-base leading-relaxed italic">
          {addPanguText(post.highlight)}
        </blockquote>
      )}

      {/* Author + meta */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400 pb-6 mb-8 border-b border-slate-200 dark:border-slate-700">
        <span className="flex items-center gap-1.5">
          <UiIcon name="pencil" className="w-4 h-4 shrink-0" />
          <span className="font-medium text-slate-700 dark:text-slate-200">{post.author}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <UiIcon name="calendar" className="w-4 h-4 shrink-0" />
          <span>
            {originalDate ? `發布：${originalDate}，更新：${formattedDate}` : `發布：${formattedDate}`}
          </span>
        </span>
        <span className="flex items-center gap-1.5">
          <UiIcon name="eye" className="w-4 h-4 shrink-0" />
          <ViewCounter slug={`blog/${slug}`} />
        </span>
      </div>

      {/* Content */}
      <div
        className="prose"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />

      {/* Sources */}
      {(post.source || (post.references && post.references.length > 0)) && (
        <div className="mt-10 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
          <p className="font-semibold text-slate-600 dark:text-slate-300 mb-2">參考資料</p>
          <ul className="space-y-1">
            {post.source && (
              <li>
                {post.source_url ? (
                  <a href={post.source_url} target="_blank" rel="noopener noreferrer" className="underline hover:text-sky-500">
                    {post.source}
                  </a>
                ) : (
                  <span>{post.source}</span>
                )}
              </li>
            )}
            {post.references?.map((ref, i) => (
              <li key={i}>
                {ref.url ? (
                  <a href={ref.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-sky-500">
                    {ref.title}
                  </a>
                ) : (
                  <span>{ref.title}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 讀完之後的去處。改版前這裡只有一條「返回文章列表」，站內連結是 0 條。 */}
      {post.series && seriesPosts.length > 1 && (
        <SeriesNav series={post.series} posts={seriesPosts} currentSlug={slug} />
      )}

      <AdjacentNav prev={prev} next={next} category={post.category} bySeries={bySeries} />

      <RelatedPosts posts={relatedPosts} />

      {/* Back */}
      <div className="mt-10">
        <a
          href={`${BASE_PATH}/blog/`}
          className="text-sm text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
        >
          ← 返回文章列表
        </a>
      </div>
    </article>
  );
}
