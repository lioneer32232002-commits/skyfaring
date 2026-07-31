"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * 補 Cloudflare Web Analytics 漏掉的用戶端導覽。
 *
 * beacon.min.js 偵測 SPA 路由的方式有兩條：覆寫 history.pushState、監聽 popstate。
 * 但 beacon 是 defer 載入，Next 的 router 在那之前就把原生 pushState 存成自己的參考，
 * 之後點卡片導覽是直接呼叫原生的那支，繞過 beacon 的覆寫，所以那次瀏覽 Cloudflare 收不到。
 * （2026-07-31 線上實測：初次載入送 1 次 rum、點卡片 0 次、按上一頁 1 次。）
 *
 * popstate 這條路是通的，所以路徑變化後補發一個 popstate 讓 beacon 記錄。
 * 真正的上一頁／下一頁本來就會觸發 popstate，那種情況不補，否則會重複計。
 *
 * GA4 不需要處理：它的加強型評估會自己聽瀏覽器記錄事件，
 * 用戶端導覽已經有送出正確網址與標題的 page_view。
 */
export default function RouteAnalytics() {
  const pathname = usePathname();
  const firstRun = useRef(true);
  const poppedPath = useRef<string | null>(null);

  useEffect(() => {
    const onPopState = () => {
      poppedPath.current = window.location.pathname;
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    // 初次載入 beacon 自己會送一次。
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    // 這次路徑變化來自真正的上一頁／下一頁，beacon 已經收到了。
    if (poppedPath.current === pathname) {
      poppedPath.current = null;
      return;
    }
    window.dispatchEvent(
      new PopStateEvent("popstate", { state: window.history.state }),
    );
  }, [pathname]);

  return null;
}
