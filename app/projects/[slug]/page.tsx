import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PROJECT_PAGES, getProjectPageBySlug } from "@/lib/projectPages";
import { PROJECTS } from "@/lib/projects";
import { accentForGroup } from "@/lib/projectAccent";
import { getGroupBySlug } from "@/lib/taxonomy";
import ProjectIcon from "@/components/ProjectIcon";
import TopicIcon from "@/components/TopicIcon";
import UiIcon from "@/components/UiIcon";
import DashboardLiveStat from "@/components/DashboardLiveStat";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://skyfaring.net";

/** 儀表板張數與「N 頁共同的做法」用的中文數字，超出範圍就退回阿拉伯數字。 */
function cjkNum(n: number): string {
  return ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"][n] ?? String(n);
}

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

  const listedProject = PROJECTS.find((p) => p.introSlug === slug);
  const accent = accentForGroup(listedProject?.group);

  const isExternal = /^https?:\/\//.test(project.url);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      project.dashboards
        ? {
            "@type": "CollectionPage",
            name: project.title,
            description: project.metaDescription,
            url: `${SITE_URL}/projects/${project.slug}/`,
            inLanguage: "zh-TW",
            isAccessibleForFree: true,
            author: { "@type": "Person", name: "Skyfaring" },
            isPartOf: { "@type": "WebSite", name: "Skyfaring", url: `${SITE_URL}/` },
            hasPart: project.dashboards.map((d) => ({
              "@type": "WebApplication",
              name: d.title,
              // 外部儀表板（例如 tenders.skyfaring.net）已是絕對網址，不能再接 SITE_URL。
              url: /^https?:\/\//.test(d.url) ? d.url : `${SITE_URL}${d.url}`,
              inLanguage: "zh-TW",
              isAccessibleForFree: true,
            })),
          }
        : {
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
        <a href={`${BASE_PATH}/`} className="whitespace-nowrap hover:text-sky-500">首頁</a>
        <span className="mx-1.5">/</span>
        <a href={`${BASE_PATH}/projects/`} className="whitespace-nowrap hover:text-sky-500">專案</a>
        <span className="mx-1.5">/</span>
        {/* 最後一節是頁面標題，最長 24 個字，nowrap 會在 375px 撐出橫向捲軸，所以讓它照常換行 */}
        <span className="text-slate-500 dark:text-slate-400">{project.title}</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        {/*
          圖示跟專案卡用同一組 SVG 與同一份色票（lib/projectAccent.ts），
          導讀頁與卡片才不會一邊 emoji、一邊線條圖。
          在 lib/projects.ts 反查不到對應專案時退回 lib/projectPages.ts 的 emoji。
        */}
        {listedProject ? (
          <div
            className={`w-12 h-12 mb-4 rounded-xl flex items-center justify-center ${accent.iconBg} ${accent.iconText}`}
          >
            <ProjectIcon name={listedProject.icon} className="w-6 h-6" />
          </div>
        ) : (
          <div className="text-5xl mb-4">{project.icon}</div>
        )}
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-slate-100 leading-tight mb-3 text-balance">
          {project.title}
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed text-pretty">
          {project.tagline}
        </p>
      </div>

      {/* Primary CTA */}
      {!project.dashboards && (
        <a
          href={project.url}
          {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="group inline-flex items-center gap-2.5 px-6 py-3 mb-12 rounded-xl border border-sky-300 dark:border-sky-500/40 text-sky-700 dark:text-sky-300 font-semibold hover:bg-sky-50 dark:hover:bg-sky-500/10 hover:border-sky-400 dark:hover:border-sky-500/60 transition-colors"
        >
          <span className="whitespace-nowrap">{project.launchCta}</span>
          <UiIcon
            name="arrow-up-right"
            className="w-[18px] h-[18px] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </a>
      )}

      {/* Intro */}
      <div className="space-y-5 mb-12">
        {project.intro.map((para, i) => (
          <p key={i} className="text-slate-600 dark:text-slate-300 leading-loose">
            {para}
          </p>
        ))}
      </div>

      {/* Dashboards */}
      {project.dashboards && (
        <section className="mb-12">
          <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-5">
            {cjkNum(project.dashboards.length)}個儀表板
          </h2>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {project.dashboards.map((d) => (
              <a
                key={d.title}
                href={d.url}
                {...(/^https?:\/\//.test(d.url)
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="group flex flex-col sm:flex-row sm:items-baseline gap-1.5 sm:gap-6 py-5 first:pt-0"
              >
                <div className="sm:w-56 sm:shrink-0">
                  <h3 className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors text-balance">
                      {d.title}
                    </span>
                    <UiIcon
                      name="arrow-up-right"
                      className="w-[14px] h-[14px] shrink-0 text-slate-400 dark:text-slate-500"
                    />
                  </h3>
                  <p className="text-[13px] whitespace-nowrap text-slate-500 dark:text-slate-400 mt-1">
                    {d.cadence}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed text-pretty">
                    {d.desc}
                  </p>
                  {d.liveStat && (
                    <DashboardLiveStat
                      source={d.liveStat}
                      className="text-[13px] font-medium whitespace-nowrap text-sky-600 dark:text-sky-400 mt-1.5"
                    />
                  )}
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Features */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-5">
          {project.dashboards ? `${cjkNum(project.dashboards.length)}頁共同的做法` : "這個站裡有什麼"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {project.features.map((f) => (
            <div
              key={f.title}
              className="p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2 text-balance">
                {f.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed text-pretty">
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
      {!project.dashboards && (
        <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 mb-10">
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            想實際看看，直接打開{project.title}。
          </p>
          <a
            href={project.url}
            {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-xl border border-sky-300 dark:border-sky-500/40 bg-white dark:bg-transparent text-sky-700 dark:text-sky-300 font-semibold hover:bg-sky-50 dark:hover:bg-sky-500/10 hover:border-sky-400 dark:hover:border-sky-500/60 transition-colors"
          >
            <span className="whitespace-nowrap">{project.launchCta}</span>
            <UiIcon
              name="arrow-up-right"
              className="w-[18px] h-[18px] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </a>
        </div>
      )}

      {/* Cross-links */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <a href={`${BASE_PATH}/projects/`} className="whitespace-nowrap text-sky-600 dark:text-sky-400 hover:underline">
          ← 看所有專案
        </a>
        {relatedTopic && (
          <a
            href={`${BASE_PATH}/topics/${relatedTopic.slug}/`}
            className="inline-flex items-center gap-1 whitespace-nowrap text-sky-600 dark:text-sky-400 hover:underline"
          >
            <TopicIcon name={relatedTopic.icon} className="w-4 h-4 shrink-0" />
            相關文章：{relatedTopic.label} →
          </a>
        )}
        <a href={`${BASE_PATH}/blog/`} className="whitespace-nowrap text-sky-600 dark:text-sky-400 hover:underline">
          全部文章 →
        </a>
      </div>
    </div>
  );
}
