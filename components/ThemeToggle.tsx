"use client";

import { useSyncExternalStore } from "react";
import UiIcon from "@/components/UiIcon";

type Theme = "light" | "dark";

/**
 * 深淺色切換。
 *
 * 「沒選過」的狀態不寫 data-theme，讓 CSS 的 prefers-color-scheme 決定，
 * 所以第一次造訪完全不依賴 JS，也不會閃。一旦按過就寫進 localStorage
 * 並在 :root 標上 data-theme，之後由 layout 的 inline script 在 paint 前補回。
 *
 * 生效的主題是瀏覽器狀態（localStorage 加上系統偏好），不是 React 自己的狀態，
 * 所以用 useSyncExternalStore 讀而不是在 effect 裡 setState——後者會觸發連鎖渲染。
 * 順帶好處是系統偏好在使用中被改掉時，按鈕圖示會跟著更新。
 */

/** 同一份文件內改 localStorage 不會觸發 storage 事件，所以自己維護訂閱者。 */
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", onChange);
  // 其他分頁改了偏好時同步過來
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    mq.removeEventListener("change", onChange);
    window.removeEventListener("storage", onChange);
  };
}

function readStored(): Theme | null {
  try {
    const v = localStorage.getItem("theme");
    return v === "dark" || v === "light" ? v : null;
  } catch {
    return null;
  }
}

function getSnapshot(): Theme {
  return (
    readStored() ??
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
  );
}

/** 伺服端算不出生效的主題，回 null 讓元件先渲染佔位。 */
function getServerSnapshot(): null {
  return null;
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // 隱私模式下可能不能寫，這時只在本次瀏覽生效
    }
    emit();
  }

  if (theme === null) {
    // 佔位：尺寸與按鈕一致，避免掛載後版位跳動
    return <span className="w-8 h-8 inline-block" aria-hidden="true" />;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="w-8 h-8 inline-flex items-center justify-center rounded-full text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
      aria-label={theme === "dark" ? "切換到淺色模式" : "切換到深色模式"}
      title={theme === "dark" ? "切換到淺色模式" : "切換到深色模式"}
    >
      <UiIcon name={theme === "dark" ? "sun" : "moon"} className="w-4 h-4" />
    </button>
  );
}
