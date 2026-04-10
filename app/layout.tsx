import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = "https://lioneer32232002-commits.github.io/skyfaring";
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const SITE_NAME = "Skyfaring";
const SITE_DESC = "運動數據分析、飛航安全數據分析、詠春拳、歷史與軍事閱讀心得分享。";
const DEFAULT_OG = `${SITE_URL}/images/og-default.png`;

export const metadata: Metadata = {
  title: { default: "Skyfaring", template: "%s — Skyfaring" },
  description: SITE_DESC,
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  icons: {
    icon: [{ url: `${BASE_PATH}/favicon.svg`, type: "image/svg+xml" }],
  },
  openGraph: {
    type: "website",
    locale: "zh_TW",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Skyfaring",
    description: SITE_DESC,
    images: [{ url: DEFAULT_OG, width: 1200, height: 630, alt: "Skyfaring" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Skyfaring",
    description: SITE_DESC,
    images: [DEFAULT_OG],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className="h-full">
      <head>
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-ZLQY8WT257"></script>
        <script dangerouslySetInnerHTML={{ __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-ZLQY8WT257');
        `}} />
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
              <img src={`${BASE_PATH}/favicon.svg`} alt="" width={22} height={22} />
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
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
              {/* Brand */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <img src={`${BASE_PATH}/favicon.svg`} alt="" width={18} height={18} />
                  <span className="font-bold text-slate-700 dark:text-slate-200">Skyfaring</span>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                  運動數據分析 · 飛航安全 · 詠春拳<br />歷史與軍事閱讀心得
                </p>
              </div>
              {/* Links */}
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">專案</p>
                <ul className="space-y-2 text-xs text-slate-400 dark:text-slate-500">
                  <li><a href="https://lioneer32232002-commits.github.io/lioneers-web/" target="_blank" rel="noopener noreferrer" className="hover:text-sky-500">攻城獅數據站 ↗</a></li>
                  <li><a href="https://yi-tienpan.blogspot.com/" target="_blank" rel="noopener noreferrer" className="hover:text-sky-500">舊站文章庫 ↗</a></li>
                </ul>
              </div>
              {/* Contact */}
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">聯絡</p>
                <ul className="space-y-2 text-xs text-slate-400 dark:text-slate-500">
                  <li>
                    <a href="mailto:wizard32232002@gmail.com" className="hover:text-sky-500 flex items-center gap-1">
                      <span>✉</span> wizard32232002@gmail.com
                    </a>
                  </li>
                  <li>
                    <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-sky-500 flex items-center gap-1">
                      <span>f</span> Facebook
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Photo credits + copyright */}
            <div className="border-t border-slate-100 dark:border-slate-700 pt-6 text-xs text-slate-400 dark:text-slate-500">
              <p id="photo-credits" className="mb-1">
                部分圖片來自 <a href="https://unsplash.com" className="underline hover:text-sky-500">Unsplash</a>（<a href="https://unsplash.com/license" className="underline hover:text-sky-500">Unsplash License</a>），出處標示於各頁面。
              </p>
              <p>© {new Date().getFullYear()} Skyfaring. 部分內容依 CC BY 授權條款使用。</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
