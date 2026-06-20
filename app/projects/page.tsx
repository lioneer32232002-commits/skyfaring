import type { Metadata } from "next";
import { PROJECTS } from "@/lib/projects";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://skyfaring.pages.dev";

export const metadata: Metadata = {
  title: "專案",
  description: "Skyfaring 的所有專案：解放軍擾台動態追蹤、歷史學院、飛行線上、戰史檔案館、無人機技術情報、TPBL Lens 等數據與互動工具。",
  alternates: { canonical: "/projects/" },
};

export default function ProjectsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "專案",
    url: `${SITE_URL}/projects/`,
    inLanguage: "zh-TW",
    isPartOf: { "@type": "WebSite", name: "Skyfaring", url: `${SITE_URL}/` },
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">專案</h1>
        <p className="text-slate-500 dark:text-slate-400">
          把數據與興趣做成可以實際打開來用的工具，共 {PROJECTS.length} 個。
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <h2 className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                {proj.title}
                {opensExternal && <span className="ml-1 text-slate-400 text-xs">↗</span>}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {proj.description}
              </p>
              {proj.introSlug && (
                <span className="inline-block mt-3 text-xs text-sky-600 dark:text-sky-400">
                  看專案導讀 →
                </span>
              )}
            </a>
          );
        })}
      </div>
    </div>
  );
}
