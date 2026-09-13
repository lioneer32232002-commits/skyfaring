import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PROJECT_PAGES, getProjectPageBySlug } from "@/lib/projectPages";
import { PROJECTS } from "@/lib/projects";
import { accentNameForGroup } from "@/lib/projectAccent";
import { getGroupBySlug } from "@/lib/taxonomy";
import PageHero from "@/components/PageHero";
import ProjectIcon from "@/components/ProjectIcon";
import TopicIcon from "@/components/TopicIcon";
import UiIcon from "@/components/UiIcon";
import DashboardLiveStat from "@/components/DashboardLiveStat";
import { CadenceStrip, cadenceFromLabel } from "@/components/viz";

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
  const accentName = accentNameForGroup(listedProject?.group);

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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHero
        variant="accent"
        accent={accentName}
        width="4xl"
        breadcrumb={
          <>
            <a href={`${BASE_PATH}/`} className="whitespace-nowrap hover:text-sky-500">首頁</a>
            <span className="mx-1.5">/</span>
            <a href={`${BASE_PATH}/projects/`} className="whitespace-nowrap hover:text-sky-500">專案</a>
            <span className="mx-1.5">/</span>
            {/* 最後一節是頁面標題，最長 24 個字，nowrap 會在 375px 撐出橫向捲軸，所以讓它照常換行 */}
            <span className="text-slate-500 dark:text-slate-400">{project.title}</span>
          </>
        }
        /*
          圖示跟專案卡用同一組 SVG 與同一份色票（lib/projectAccent.ts），
          導讀頁與卡片才不會一邊 emoji、一邊線條圖。
          在 lib/projects.ts 反查不到對應專案時退回 lib/projectPages.ts 的 emoji。
        */
        icon={
          listedProject ? (
            <ProjectIcon name={listedProject.icon} className="w-7 h-7" />
          ) : (
            <span className="text-3xl leading-none">{project.icon}</span>
          )
        }
        title={project.title}
        description={project.tagline}
      >
        {project.dashboards ? (
          /* 入口頁型專案沒有單一 CTA，改列出底下的儀表板，點了跳到下面的清單 */
          <div className="flex flex-wrap gap-2">
            {project.dashboards.map((d) => (
              <a
                key={d.title}
                href="#dashboards"
                className="inline-flex items-baseline gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/60 text-sm whitespace-nowrap text-slate-600 dark:text-slate-300 hover:border-sky-300 dark:hover:border-sky-500/60 hover:text-sky-700 dark:hover:text-sky-300 transition-colors"
              >
                <span>{d.title}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{d.cadence}</span>
              </a>
            ))}
          </div>
        ) : (
          <a
            href={project.url}
            {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400 dark:text-slate-900 font-semibold transition-colors"
          >
            <span className="whitespace-nowrap">{project.launchCta}</span>
            <UiIcon
              name="arrow-up-right"
              className="w-[18px] h-[18px] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </a>
        )}
      </PageHero>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">

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
        /* scroll-mt-20：hero 的錨點連結跳過來時，標題不要被 sticky header 蓋住 */
        <section id="dashboards" className="mb-12 scroll-mt-20">
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
                {/* w-64：週更的節奏條加「每週更新」共 233px，欄寬要放得下才不會把文字擠到第二行 */}
                <div className="sm:w-64 sm:shrink-0">
                  <h3 className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors text-balance">
                      {d.title}
                    </span>
                    <UiIcon
                      name="arrow-up-right"
                      className="w-[14px] h-[14px] shrink-0 text-slate-400 dark:text-slate-500"
                    />
                  </h3>
                  {/* 更新頻率畫成一年 12 格的節奏條，右邊維持原本的文字說法 */}
                  <div className="mt-1.5">
                    <CadenceStrip
                      cadence={cadenceFromLabel(d.cadence)}
                      label={d.cadence}
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed text-pretty">
                    {d.desc}
                  </p>
                  {d.liveStat && (
                    <DashboardLiveStat source={d.liveStat} className="mt-3" />
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
    </>
  );
}
