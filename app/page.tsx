import { getAllPostMetas } from "@/lib/posts";
import ArticleCard from "@/components/ArticleCard";
import ViewCounter from "@/components/ViewCounter";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const PROJECTS = [
  {
    title: "Skyfaring Blog",
    description: "航空安全報告整理、飛行知識與產業分析",
    url: `${BASE_PATH}/blog/`,
    icon: "✈",
    internal: true,
  },
];

export default function HomePage() {
  const posts = getAllPostMetas();

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-sky-900 to-slate-800 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">✈</span>
            <span className="text-sky-400 font-semibold tracking-widest text-sm uppercase">Skyfaring</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4">
            航空、安全、探索
          </h1>
          <p className="text-slate-300 text-lg max-w-xl leading-relaxed mb-8">
            整理 ICAO 等機構的飛安資料，用圖表和白話說明複雜的航空安全報告。
            也在這裡記錄其他研究與實作。
          </p>
          <div className="text-sm text-slate-400 flex items-center gap-2">
            <span>本站瀏覽次數：</span>
            <ViewCounter slug="home" className="text-sky-300 font-semibold" />
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">

        {/* Projects / Portal */}
        {PROJECTS.length > 0 && (
          <section className="mb-14">
            <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-5 flex items-center gap-2">
              <span>🗂</span> 我的專案
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {PROJECTS.map((proj) => (
                <a
                  key={proj.title}
                  href={proj.url}
                  className="block p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="text-3xl mb-3">{proj.icon}</div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                    {proj.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {proj.description}
                  </p>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Latest Articles */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <span>📰</span> 最新文章
            </h2>
            <a
              href={`${BASE_PATH}/blog/`}
              className="text-sm text-sky-600 dark:text-sky-400 hover:underline"
            >
              查看全部 →
            </a>
          </div>
          {posts.length === 0 ? (
            <p className="text-slate-400">目前還沒有文章。</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <ArticleCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
