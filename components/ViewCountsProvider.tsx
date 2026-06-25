"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getViewCounts } from "@/lib/supabase";

// undefined = 不在任何 Provider 內（呼叫端自己 fallback 單筆抓）
const ViewCountsContext = createContext<{
  counts: Record<string, number>;
  loaded: boolean;
} | undefined>(undefined);

export default function ViewCountsProvider({
  slugs,
  children,
}: {
  slugs: string[];
  children: ReactNode;
}) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loaded, setLoaded] = useState(false);

  // slugs 以穩定字串當依賴，避免每次 render 的新陣列觸發重抓
  const key = slugs.join("|");
  useEffect(() => {
    let alive = true;
    getViewCounts(slugs).then((c) => {
      if (!alive) return;
      setCounts(c);
      setLoaded(true);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return (
    <ViewCountsContext.Provider value={{ counts, loaded }}>
      {children}
    </ViewCountsContext.Provider>
  );
}

/**
 * 在 Provider 內：回傳該 slug 的 count（未載入完回 null）。
 * 不在 Provider 內：回傳 undefined，呼叫端據此自行單筆抓。
 */
export function useViewCount(slug: string): number | null | undefined {
  const ctx = useContext(ViewCountsContext);
  if (ctx === undefined) return undefined;
  if (!ctx.loaded) return null;
  return ctx.counts[slug] ?? 0;
}
