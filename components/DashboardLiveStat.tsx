"use client";

import { useEffect, useState } from "react";

/**
 * 儀表板卡片上的即時數字。目前只給標案觀測站用（lib/projectPages.ts 的 liveStat: "tenders"）。
 *
 * tenders.skyfaring.net 的 summary.json 已開 CORS（Access-Control-Allow-Origin: *），
 * 由瀏覽器直接抓，本站是靜態輸出、不經任何 Function，不吃 Pages Functions 配額。
 * 初始 render 一律回 null，數字只在 useEffect 之後出現，避免 SSR 與 client 對不起來。
 * 抓不到就什麼都不顯示，不放 placeholder。
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
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    fetch(SOURCES[source])
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data: Summary) => {
        const stat = data?.totals?.this_year;
        if (!alive || typeof stat?.awarded_count !== "number" || typeof stat?.awarded_amount !== "number") {
          return;
        }
        setText(`今年決標 ${stat.awarded_count.toLocaleString()} 件・${(stat.awarded_amount / 1e8).toFixed(2)} 億`);
      })
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, [source]);

  if (!text) return null;

  return <p className={className}>{text}</p>;
}
