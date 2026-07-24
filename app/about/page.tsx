import type { Metadata } from "next";
import { PROJECTS } from "@/lib/projects";
import ProjectGroups from "@/components/ProjectGroups";
import UiIcon from "@/components/UiIcon";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://skyfaring.net";
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// TODO: LinkedIn 個人檔案建好後，把網址填回聯絡區（原本的連結區塊見 git 歷史）

export const metadata: Metadata = {
  title: "關於我",
  description: "Adam Pan，資深專案經理，用 AI 工具獨立開發數據產品，領域涵蓋無人機情報、運動數據與歷史教育。",
  alternates: { canonical: "/about/" },
};

const SKILLS = [
  {
    title: "AI 應用開發",
    desc: "用 AI 工具打造網站與數據儀表板，Next.js 加 Cloudflare Pages，已上線 9 個專案。",
  },
  {
    title: "數據分析與統計",
    desc: "假設檢定、組間比較、統合分析與網絡統合分析。",
  },
  {
    title: "行銷與內容製作",
    desc: "社群經營、文案、美術設計、短影片與影像後製。",
  },
  {
    title: "簡報與教學",
    desc: "簡報設計，國立中正大學受邀講師（2025 年秋季半學期簡報設計課程）。",
  },
];

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: "關於我",
    url: `${SITE_URL}/about/`,
    inLanguage: "zh-TW",
    isPartOf: { "@type": "WebSite", name: "Skyfaring", url: `${SITE_URL}/` },
    mainEntity: {
      "@type": "Person",
      name: "Adam Pan",
      email: "mailto:wizard32232002@gmail.com",
      sameAs: ["https://yi-tienpan.blogspot.com/"],
    },
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          關於我（Adam Pan）
        </h1>
        <p className="text-slate-600 dark:text-slate-300 leading-loose max-w-2xl">
          資深專案經理，任職於教育訓練機構，負責課程營運、行銷與統計分析。近年用 AI 工具獨立開發多個數據產品，從企劃、開發到上線一手包辦，領域涵蓋無人機情報、運動數據與歷史教育。
        </p>
      </div>

      {/* Skills */}
      <section className="mb-14">
        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-5">
          能做什麼
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SKILLS.map((s) => (
            <div
              key={s.title}
              className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm"
            >
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">
                {s.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Selected projects */}
      <section className="mb-14">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <UiIcon name="grid" className="w-5 h-5 shrink-0" /> 精選專案
          </h2>
          <a
            href={`${BASE_PATH}/projects/`}
            className="text-sm text-sky-600 dark:text-sky-400 hover:underline"
          >
            看所有專案（{PROJECTS.length}）→
          </a>
        </div>
        <ProjectGroups variant="compact" groupAs="h3" />
      </section>

      {/* Contact */}
      <section>
        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-5">
          聯絡
        </h2>
        <ul className="space-y-3 text-slate-600 dark:text-slate-300">
          <li>
            <a
              href="mailto:wizard32232002@gmail.com"
              className="inline-flex items-center gap-2 hover:text-sky-500"
            >
              <UiIcon name="mail" className="w-4 h-4 shrink-0" /> wizard32232002@gmail.com
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}
