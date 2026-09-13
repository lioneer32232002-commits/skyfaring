import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import UiIcon from "@/components/UiIcon";

export const metadata: Metadata = {
  title: "TPBL Lens",
  description: "台灣職籃 TPBL 數據透鏡——例行賽統計、球員效率、球隊分析。",
  alternates: { canonical: "/tpbl-lens/" },
};

const DATASETS = [
  {
    season: "2025–26",
    title: "TPBL 2025-26 例行賽統計數據",
    description: "球員個人數據、球隊整體數據、進階效率指標，涵蓋完整例行賽賽程。",
    url: "https://tpbl-lens.skyfaring.net/",
    badge: "聯盟",
  },
  {
    season: "2025–26",
    title: "新竹攻城獅數據站",
    description: "新竹攻城獅數據儀表板，含勝負預測、球員效率分析。",
    url: "https://lioneers-web.pages.dev/",
    badge: "球隊",
  },
];

export default function TpblLensPage() {
  return (
    <>
      {/* Hero */}
      <PageHero
        variant="photo"
        tone="orange"
        image="/images/basketball-court-hero.jpg"
        eyebrow="TPBL Lens"
        title="台灣職籃數據透鏡"
        description="用數據看台灣職籃——球員效率、球隊進階指標、賽季趨勢一站瀏覽。"
      >
        {/* 三項各自 nowrap，「·」跟著前一項走，手機折行時不會掉單字 */}
        <div className="text-slate-400 text-sm max-w-xl leading-relaxed flex flex-wrap gap-x-3 gap-y-1">
          <span className="whitespace-nowrap">例行賽統計 ·</span>
          <span className="whitespace-nowrap">進階效率分析 ·</span>
          <span className="whitespace-nowrap">球員數據比較</span>
        </div>
      </PageHero>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">

        {/* Dataset cards */}
        <section className="mb-14">
          <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-5 flex items-center gap-2">
            <UiIcon name="chart" className="w-5 h-5 shrink-0" /> 數據集
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {DATASETS.map((ds) => (
              <a
                key={ds.title}
                href={ds.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold whitespace-nowrap text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-2 py-0.5 rounded-full">
                    {ds.badge}
                  </span>
                  <span className="text-xs whitespace-nowrap text-slate-500 dark:text-slate-400">{ds.season}</span>
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors mb-2">
                  {ds.title}
                  {/* 箭頭不縮字級，理由同 components/ProjectCard.tsx 的 titleWithArrow */}
                  <span className="ml-1 text-slate-400">↗</span>
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {ds.description}
                </p>
              </a>
            ))}
          </div>
        </section>

        {/* About section */}
        <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-base font-bold text-slate-700 dark:text-slate-200 mb-3">關於 TPBL Lens</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            TPBL Lens 是針對台灣職籃（TPBL）的數據分析工具，提供球員個人統計、球隊效率指標與賽季趨勢。
            目前涵蓋 2025–26 例行賽數據，未來將持續新增賽季資料與專題分析。
          </p>
        </section>

      </div>
    </>
  );
}
