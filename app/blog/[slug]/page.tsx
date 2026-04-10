import { getAllSlugs, getPost } from "@/lib/posts";
import ViewCounter from "@/components/ViewCounter";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

const SITE_URL = "https://lioneer32232002-commits.github.io/skyfaring";
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
    },
    url: `${SITE_URL}/blog/${slug}/`,
    ...(post.heroImage && {
      image: { "@type": "ImageObject", url: `${SITE_URL}${post.heroImage}` },
    }),
  };

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* HERO image */}
      {post.heroImage && (
        <figure className="mb-8 -mx-4 sm:mx-0 sm:rounded-2xl overflow-hidden">
          <img
            src={`${BASE_PATH}${post.heroImage}`}
            alt={post.heroAlt ?? post.title}
            className="w-full max-w-full object-cover"
            style={{ maxHeight: "400px" }}
          />
          {post.heroCredit && (
            <figcaption className="text-xs text-slate-400 text-right mt-1 px-2">
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

      {/* Author + meta */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400 pb-6 mb-8 border-b border-slate-200 dark:border-slate-700">
        <span className="flex items-center gap-1.5">
          <span>✍</span>
          <span className="font-medium text-slate-700 dark:text-slate-200">{post.author}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span>📅</span>
          <span>
            {originalDate ? `發布：${originalDate}，更新：${formattedDate}` : `發布：${formattedDate}`}
          </span>
        </span>
        <span className="flex items-center gap-1.5">
          <span>👁</span>
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
