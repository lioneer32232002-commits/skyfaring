import Link from "next/link";
import type { ReactNode } from "react";

/**
 * 水平長條清單，比較同一組項目的數量大小（主題群篇數、分類篇數）。
 *
 * 單一色相加每列直接標數值，所以不需要圖例，也不需要 X 軸。
 * 長條用 div 而非 SVG，字級與間距才會跟著版面的排版尺度走。
 */

export interface BarRowItem {
  label: string;
  value: number;
  href?: string;
  icon?: ReactNode;
}

export interface BarRowProps {
  items: BarRowItem[];
  /** 軌道滿格對應的數值，省略時取 items 裡的最大值 */
  max?: number;
  /** 數值後的單位，例如「篇」 */
  unit?: string;
}

const LABEL =
  "w-32 sm:w-40 shrink-0 flex items-center gap-1.5 text-sm whitespace-nowrap overflow-hidden text-ellipsis text-slate-700 dark:text-slate-200";

export default function BarRow({ items, max, unit }: BarRowProps) {
  const ceiling = Math.max(1, max ?? Math.max(0, ...items.map((i) => i.value)));

  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => {
        const percent = Math.min(100, (item.value / ceiling) * 100);

        const inner = (
          <>
            <span
              className={`${LABEL} group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors`}
            >
              {item.icon && (
                <span className="shrink-0 text-slate-400 dark:text-slate-500">
                  {item.icon}
                </span>
              )}
              <span className="overflow-hidden text-ellipsis">{item.label}</span>
            </span>
            <span className="flex-1 h-2 rounded-r-full bg-slate-100 dark:bg-slate-800">
              <span
                className="block h-2 rounded-r-full bg-sky-500"
                style={{ width: `${percent}%` }}
              />
            </span>
            <span className="shrink-0 w-14 text-right text-sm tabular-nums whitespace-nowrap text-slate-500 dark:text-slate-400">
              {item.value}
              {unit ? ` ${unit}` : ""}
            </span>
          </>
        );

        const rowClass = "flex items-center gap-3";

        return (
          <li key={item.label}>
            {item.href ? (
              <Link href={item.href} className={`group ${rowClass}`}>
                {inner}
              </Link>
            ) : (
              <div className={rowClass}>{inner}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
