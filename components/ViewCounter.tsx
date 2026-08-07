"use client";

import { useEffect, useState } from "react";
import { getTotalViewCount, incrementViewCount } from "@/lib/supabase";

interface ViewCounterProps {
  slug: string;
  className?: string;
  /** 顯示全站累計總數而非這個 slug 的數字；slug 本身仍照常 +1。 */
  total?: boolean;
}

export default function ViewCounter({ slug, className, total = false }: ViewCounterProps) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    incrementViewCount(slug)
      .then((c) => (total ? getTotalViewCount() : c))
      .then(setCount);
  }, [slug, total]);

  if (count === null || count === 0) {
    return <span className={className}>— 次瀏覽</span>;
  }

  return (
    <span className={className}>
      {count.toLocaleString()} 次瀏覽
    </span>
  );
}
