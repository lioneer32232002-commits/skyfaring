import type { Metadata } from "next";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

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
    url: "https://tpbl-lens.pages.dev/",
    badge: "例行賽",
  },
];

export default function TpblLensPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${BASE_PATH}/images/basketball-court-hero.jpg)` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/92 via-slate-900/78 to-orange-900/70" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-24 relative">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-orange-400 font-semibold tracking-widest text-sm uppercase">TPBL Lens</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4">
            台灣職籃數據透鏡
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl leading-relaxed mb-3">
            用數據看台灣職籃——球員效率、球隊進階指標、賽季趨勢一站瀏覽。
          </p>
          <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
            例行賽統計 · 進階效率分析 · 球員數據比較
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">

        {/* Dataset cards */}
        <section className="mb-14">
          <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-5 flex items-center gap-2">
            <span>📊</span> 數據集
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {DATASETS.map((ds) => (
              <a
                key={ds.title}
                href={ds.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-2 py-0.5 rounded-full">
                    {ds.badge}
                  </span>
                  <span className="text-xs text-slate-400">{ds.season}</span>
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors mb-2">
                  {ds.title}
                  <span className="ml-1 text-slate-400 text-xs">↗</span>
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {ds.description}
                </p>
              </a>
            ))}
          </div>
        </section>

        {/* About section */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6">
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
