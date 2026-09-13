"use client";

import { useEffect, useState } from "react";
import { getTotalViewCount, incrementViewCount } from "@/lib/supabase";

interface ViewCounterProps {
  slug: string;
  className?: string;
  /** 顯示全站累計總數而非這個 slug 的數字；slug 本身仍照常 +1。 */
  total?: boolean;
  /** 只輸出數字（或「—」），單位由外層排；首頁 hero 的數字列用這個把單位縮小放旁邊。 */
  numberOnly?: boolean;
}

export default function ViewCounter({ slug, className, total = false, numberOnly = false }: ViewCounterProps) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    incrementViewCount(slug)
      .then((c) => (total ? getTotalViewCount() : c))
      .then(setCount);
  }, [slug, total]);

  // 數字與單位綁在同一個 nowrap 片段，「次瀏覽」不會單獨掉到下一行
  const number = count === null || count === 0 ? "—" : count.toLocaleString();

  return (
    <span className={`whitespace-nowrap ${className ?? ""}`}>
      {numberOnly ? number : `${number} 次瀏覽`}
    </span>
  );
}
