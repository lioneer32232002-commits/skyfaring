"use client";

import { useEffect, useState } from "react";

/**
 * 儀表板卡片上的即時數字。目前只給標案觀測站用（lib/projectPages.ts 的 liveStat: "tenders"）。
 *
 * tenders.skyfaring.net 的 summary.json 已開 CORS（Access-Control-Allow-Origin: *），
 * 由瀏覽器直接抓，本站是靜態輸出、不經任何 Function，不吃 Pages Functions 配額。
 * 初始 render 一律回 null，數字只在 useEffect 之後出現，避免 SSR 與 client 對不起來。
 * 抓不到就什麼都不顯示，不放 placeholder。
 *
 * 版面用數字磚的樣子：小標在上、兩個數字在下，件數與金額分開標單位，
 * 讀者掃過去先看到數字本身，不用從一句話裡挑出數字。
 */

const SOURCES = {
  tenders: "https://tenders.skyfaring.net/data/summary.json",
} as const;

export type LiveStatSource = keyof typeof SOURCES;

interface Summary {
  totals?: {
    this_year?: {
      awarded_count?: number;
      awarded_amount?: number;
    };
  };
}

export default function DashboardLiveStat({
  source,
  className,
}: {
  source: LiveStatSource;
  className?: string;
}) {
  const [stat, setStat] = useState<{ count: string; amount: string } | null>(
    null,
  );

  useEffect(() => {
    let alive = true;

    fetch(SOURCES[source])
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data: Summary) => {
        const totals = data?.totals?.this_year;
        if (!alive || typeof totals?.awarded_count !== "number" || typeof totals?.awarded_amount !== "number") {
          return;
        }
        setStat({
          count: totals.awarded_count.toLocaleString(),
          amount: (totals.awarded_amount / 1e8).toFixed(2),
        });
      })
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, [source]);

  if (!stat) return null;

  return (
    <div className={className}>
      <span className="block text-xs text-slate-500 dark:text-slate-400">
        今年決標
      </span>
      {/* 數字與單位同一個字級：字級混用時同一行的上緣會差好幾個像素，版面檢查會誤判成換行 */}
      <span className="mt-0.5 block text-xl whitespace-nowrap text-sky-600 dark:text-sky-400">
        <span className="font-semibold tabular-nums">{stat.count}</span> 件・
        <span className="font-semibold tabular-nums">{stat.amount}</span> 億
      </span>
    </div>
  );
}
