"use client";

import { useEffect, useState } from "react";
import { incrementViewCount } from "@/lib/supabase";

interface ViewCounterProps {
  slug: string;
  className?: string;
}

export default function ViewCounter({ slug, className }: ViewCounterProps) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    incrementViewCount(slug).then((c) => setCount(c));
  }, [slug]);

  if (count === null) {
    return <span className={className}>— 次瀏覽</span>;
  }

  return (
    <span className={className}>
      {count.toLocaleString()} 次瀏覽
    </span>
  );
}
