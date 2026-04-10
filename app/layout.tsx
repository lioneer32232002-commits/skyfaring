import type { Metadata } from "next";
import "./globals.css";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: "Skyfaring — 航空安全與探索",
  description: "航空安全報告整理、飛行知識與相關資源的個人網站。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-900">
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <a href={`${BASE_PATH}/`} className="flex items-center gap-2 group">
              <span className="text-2xl">✈</span>
              <span className="font-bold text-xl text-slate-800 dark:text-slate-100 group-hover:text-sky-600 transition-colors">
                Skyfaring
              </span>
            </a>
            <nav className="flex gap-6 text-sm font-medium text-slate-500 dark:text-slate-400">
              <a href={`${BASE_PATH}/`} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">首頁</a>
              <a href={`${BASE_PATH}/blog/`} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">文章</a>
            </nav>
          </div>
        </header>

        <main className="flex-1">
          {children}
        </main>

        <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 mt-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
            <div id="photo-credits" className="text-xs text-slate-400 dark:text-slate-500 mb-4">
              <p className="font-semibold mb-1">圖片授權聲明</p>
              <p>本站部分圖片來自 <a href="https://unsplash.com" className="underline hover:text-sky-500">Unsplash</a>，依 <a href="https://unsplash.com/license" className="underline hover:text-sky-500">Unsplash License</a> 使用，個別圖片出處標示於各頁面。</p>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              © {new Date().getFullYear()} Skyfaring. 部分內容依 CC BY 授權條款使用。
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
