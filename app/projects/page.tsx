import type { Metadata } from "next";
import { PROJECTS, getGroupedProjects } from "@/lib/projects";
import ProjectGroups from "@/components/ProjectGroups";
import { StatRow, StatTile } from "@/components/viz";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://skyfaring.net";

export const metadata: Metadata = {
  title: "專案",
  description: "Skyfaring 的所有專案：解放軍擾台動態追蹤、歷史學院、飛行養成、戰史檔案館、無人機研究、TPBL Lens 等數據與互動工具。",
  alternates: { canonical: "/projects/" },
};

export default function ProjectsPage() {
  const grouped = getGroupedProjects();

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
          把數據與興趣做成可以實際打開來用的工具，
          <span className="whitespace-nowrap">共 {PROJECTS.length} 個。</span>
        </p>
        {/* 三個群組各有幾個專案，讓讀者先知道下面的清單怎麼分 */}
        <div className="mt-6">
          <StatRow cols={3}>
            {grouped.map(({ group, projects }) => (
              <StatTile
                key={group.id}
                label={group.label}
                value={projects.length}
                hint="個專案"
              />
            ))}
          </StatRow>
        </div>
      </div>

      <ProjectGroups variant="full" groupAs="h2" />
    </div>
  );
}
