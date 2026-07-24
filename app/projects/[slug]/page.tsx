import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PROJECT_PAGES, getProjectPageBySlug } from "@/lib/projectPages";
import { getGroupBySlug } from "@/lib/taxonomy";
import TopicIcon from "@/components/TopicIcon";
import UiIcon from "@/components/UiIcon";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://skyfaring.net";

export function generateStaticParams() {
  return PROJECT_PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectPageBySlug(slug);
  if (!project) return {};

  return {
    title: project.title,
    description: project.metaDescription,
    keywords: project.seoKeywords,
    alternates: { canonical: `/projects/${project.slug}/` },
    openGraph: {
      type: "website",
      locale: "zh_TW",
      url: `${SITE_URL}/projects/${project.slug}/`,
      siteName: "Skyfaring",
      title: project.title,
      description: project.metaDescription,
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.metaDescription,
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectPageBySlug(slug);
  if (!project) notFound();

  const relatedTopic = project.relatedTopicSlug
    ? getGroupBySlug(project.relatedTopicSlug)
    : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: project.title,
        description: project.metaDescription,
        url: project.url,
        inLanguage: "zh-TW",
        isAccessibleForFree: true,
        applicationCategory: "WebApplication",
        author: { "@type": "Person", name: "Skyfaring" },
        isPartOf: { "@type": "WebSite", name: "Skyfaring", url: `${SITE_URL}/` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "首頁", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "專案", item: `${SITE_URL}/projects/` },
          { "@type": "ListItem", position: 3, name: project.title, item: `${SITE_URL}/projects/${project.slug}/` },
        ],
      },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <div className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        <a href={`${BASE_PATH}/`} className="hover:text-sky-500">首頁</a>
        <span className="mx-1.5">/</span>
        <a href={`${BASE_PATH}/projects/`} className="hover:text-sky-500">專案</a>
        <span className="mx-1.5">/</span>
        <span className="text-slate-500 dark:text-slate-400">{project.title}</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="text-5xl mb-4">{project.icon}</div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-slate-100 leading-tight mb-3">
          {project.title}
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
          {project.tagline}
        </p>
      </div>

      {/* Primary CTA */}
      <a
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center gap-2.5 px-6 py-3 mb-12 rounded-xl border border-sky-300 dark:border-sky-500/40 text-sky-700 dark:text-sky-300 font-semibold hover:bg-sky-50 dark:hover:bg-sky-500/10 hover:border-sky-400 dark:hover:border-sky-500/60 transition-colors"
      >
        {project.launchCta}
        <UiIcon
          name="arrow-up-right"
          className="w-[18px] h-[18px] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </a>

      {/* Intro */}
      <div className="space-y-5 mb-12">
        {project.intro.map((para, i) => (
          <p key={i} className="text-slate-600 dark:text-slate-300 leading-loose">
            {para}
          </p>
        ))}
      </div>

      {/* Features */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-5">
          這個站裡有什麼
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {project.features.map((f) => (
            <div
              key={f.title}
              className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm"
            >
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Audience */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-3">
          適合誰
        </h2>
        <p className="text-slate-600 dark:text-slate-300 leading-loose">
          {project.audience}
        </p>
      </section>

      {/* Secondary CTA */}
      <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 mb-10">
        <p className="text-slate-600 dark:text-slate-300 mb-4">
          想實際看看，直接打開{project.title}。
        </p>
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-xl border border-sky-300 dark:border-sky-500/40 bg-white dark:bg-transparent text-sky-700 dark:text-sky-300 font-semibold hover:bg-sky-50 dark:hover:bg-sky-500/10 hover:border-sky-400 dark:hover:border-sky-500/60 transition-colors"
        >
          {project.launchCta}
          <UiIcon
            name="arrow-up-right"
            className="w-[18px] h-[18px] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </a>
      </div>

      {/* Cross-links */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <a href={`${BASE_PATH}/projects/`} className="text-sky-600 dark:text-sky-400 hover:underline">
          ← 看所有專案
        </a>
        {relatedTopic && (
          <a
            href={`${BASE_PATH}/topics/${relatedTopic.slug}/`}
            className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400 hover:underline"
          >
            <TopicIcon name={relatedTopic.icon} className="w-4 h-4 shrink-0" />
            相關文章：{relatedTopic.label} →
          </a>
        )}
        <a href={`${BASE_PATH}/blog/`} className="text-sky-600 dark:text-sky-400 hover:underline">
          全部文章 →
        </a>
      </div>
    </div>
  );
}
