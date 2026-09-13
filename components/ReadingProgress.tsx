"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 文章頁專用的閱讀進度條，貼在 sticky header 下緣。
 * header 高度已驗證為 61px（見 app/globals.css 的 scroll-margin-top 註解），
 * 所以用 top-[61px] 疊在 header 正下方，不會蓋住 header 本身的內容。
 *
 * 用 scrollY / (scrollHeight - innerHeight) 算完讀比例，scroll 事件用
 * requestAnimationFrame 節流，避免每個 scroll event 都觸發 re-render。
 * 初始 state 是 0，跟伺服端渲染（沒有 window 可用）輸出一致，不會有
 * hydration 不一致的問題；進度只在掛載後、使用者開始捲動才會更新。
 */
export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  const tickingRef = useRef(false);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? Math.min(1, Math.max(0, scrollTop / scrollable)) : 0;
      setProgress(ratio);
      tickingRef.current = false;
    };

    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed left-0 top-[61px] z-40 h-0.5 bg-sky-500 motion-safe:transition-[width] motion-safe:duration-150"
      style={{ width: `${progress * 100}%` }}
    />
  );
}
