import type { Heading } from "@/lib/headings";

interface TableOfContentsProps {
  headings: Heading[];
}

/**
 * 文章內文的目錄區塊。只有 h2 至少兩個時才值得渲染成目錄
 * （只有一個 h2 等於沒有結構好列）。
 *
 * 手機與桌機的收合行為不同（手機預設收合、桌機預設展開），但 CSS
 * 沒辦法依螢幕寬度決定 <details open> 這個屬性，所以拆成兩份 DOM，
 * 用 sm: 中斷點各自切換顯示，內容共用同一個 TocList。
 */
export default function TableOfContents({ headings }: TableOfContentsProps) {
  const chapterCount = headings.filter((heading) => heading.level === 2).length;
  if (chapterCount < 2) return null;

  return (
    <nav
      aria-label="本文目錄"
      className="mb-8 rounded-r-lg border-l-2 border-sky-400 bg-sky-50/60 py-3 pl-4 pr-4 dark:border-sky-500 dark:bg-slate-800/60"
    >
      <details className="sm:hidden">
        <summary className="cursor-pointer text-sm font-medium text-slate-600 dark:text-slate-300">
          本文目錄（{chapterCount} 節）
        </summary>
        <div className="mt-3">
          <TocList headings={headings} />
        </div>
      </details>
      <div className="hidden sm:block">
        <p className="mb-3 text-sm font-medium text-slate-600 dark:text-slate-300">本文目錄</p>
        {/* 桌機上超過 8 條就分兩欄，不然十幾條目錄會把首段推到一整個螢幕之下 */}
        <TocList headings={headings} twoColumns={headings.length > 8} />
      </div>
    </nav>
  );
}

function TocList({ headings, twoColumns = false }: TableOfContentsProps & { twoColumns?: boolean }) {
  return (
    <ul className={`space-y-1.5 ${twoColumns ? "sm:columns-2 sm:gap-8" : ""}`}>
      {headings.map((heading) => (
        <li key={heading.id} className={`break-inside-avoid ${heading.level === 3 ? "pl-4" : ""}`}>
          <a
            href={`#${heading.id}`}
            className={`block text-pretty text-slate-600 transition-colors hover:text-sky-600 dark:text-slate-300 dark:hover:text-sky-400 ${
              heading.level === 3 ? "text-xs" : "text-sm"
            }`}
          >
            {heading.text}
          </a>
        </li>
      ))}
    </ul>
  );
}
