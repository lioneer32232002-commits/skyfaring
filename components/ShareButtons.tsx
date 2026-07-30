"use client";

import { useState } from "react";
import UiIcon from "@/components/UiIcon";

/**
 * 文章分享。
 *
 * 只放三個外部平台加一個複製連結：X、Facebook、LINE。
 * LINE 對台灣讀者的分享量比另外兩個加起來還多，不能省。
 *
 * 複製連結需要用戶端 JS（clipboard API），所以整個元件是 client component，
 * 但它很小，而且分享列本來就要靠互動才有意義。
 *
 * 網址由 props 傳進來而不是讀 location：靜態匯出時伺服端沒有 location，
 * 而且用正式網域組出來的分享連結才正確（本機預覽時不會分享出 localhost）。
 */
export default function ShareButtons({
  url,
  title,
}: {
  url: string;
  title: string;
}) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const targets = [
    {
      label: "分享到 X",
      short: "X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      label: "分享到 Facebook",
      short: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      label: "分享到 LINE",
      short: "LINE",
      href: `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`,
    },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // 沒有 clipboard 權限（例如非 https）時不做事，讀者仍可用網址欄複製
    }
  }

  const btn =
    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 hover:border-sky-300 dark:hover:border-sky-700 hover:text-sky-600 dark:hover:text-sky-400 transition-colors";

  return (
    <div className="mt-10 flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mr-1">
        <UiIcon name="share" className="w-4 h-4 shrink-0" />
        分享
      </span>
      {targets.map((t) => (
        <a
          key={t.short}
          href={t.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t.label}
          className={btn}
        >
          {t.short}
        </a>
      ))}
      <button type="button" onClick={copyLink} className={btn} aria-live="polite">
        <UiIcon name="link" className="w-3.5 h-3.5 shrink-0" />
        {copied ? "已複製" : "複製連結"}
      </button>
    </div>
  );
}
