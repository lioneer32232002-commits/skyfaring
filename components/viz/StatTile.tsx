import Link from "next/link";
import type { ReactNode } from "react";

/**
 * 單一數字磚。一個數字加一行說明就講完的事不畫成圖，直接用字級撐出層級。
 * 全部是 server 元件，沒有 client JS。
 */

export interface StatTileProps {
  label: string;
  value: string | number;
  hint?: string;
  href?: string;
}

const CARD =
  "block rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3";

export default function StatTile({ label, value, hint, href }: StatTileProps) {
  const body = (
    <>
      <span className="block text-sm text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <span className="block mt-1 font-semibold text-2xl sm:text-3xl tabular-nums text-slate-800 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
        {value}
      </span>
      {hint && (
        <span className="block mt-1 text-xs text-slate-500 dark:text-slate-400">
          {hint}
        </span>
      )}
    </>
  );

  if (!href) {
    return <div className={CARD}>{body}</div>;
  }

  const className = `group ${CARD} hover:border-sky-300 dark:hover:border-sky-700 transition-colors`;

  if (/^https?:\/\//.test(href)) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {body}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {body}
    </Link>
  );
}

/**
 * 把數字磚排成一列。手機一律兩欄，桌機欄數由 cols 決定（預設 4），超過就自動換行。
 *
 * 桌機欄數寫成完整字串而不是 `sm:grid-cols-${cols}`，Tailwind 掃原始碼找類別名稱，
 * 拼接出來的類別不會被產出。
 */
const COLS: Record<2 | 3 | 4, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
};

export function StatRow({
  children,
  cols = 4,
}: {
  children: ReactNode;
  cols?: 2 | 3 | 4;
}) {
  return (
    <div className={`grid grid-cols-2 ${COLS[cols]} gap-4`}>{children}</div>
  );
}
