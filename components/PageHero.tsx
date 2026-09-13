import type { ReactNode } from "react";
import { ACCENT, type AccentName } from "@/lib/projectAccent";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * 全站共用的頁首帶。
 *
 * 動機：首頁、TPBL Lens 各有一份手寫的照片 hero，其他列表頁又各自把 h1 與統計
 * 塞在內容容器裡，同一個網站出現三種頁首語言。這個元件把頁首收成三個變體，
 * 之後新頁面直接挑一個用，不要再手寫第四種。
 *
 * - photo：首頁與 TPBL Lens。背景照片加深色漸層，白字。
 * - accent：專案導讀頁。無照片，底色是該專案群組色的淡漸層，slate 文字。
 * - plain：列表頁（文章、專案、主題、關於）。白底加一條底線。
 *
 * 內容寬一律 max-w-5xl，內距三個變體遞減（photo 最厚、plain 最薄），
 * 讓讀者從內距就分得出這是主場頁還是清單頁。
 */

export type PageHeroVariant = "photo" | "accent" | "plain";

/** photo 變體的第二色：漸層第三段與 eyebrow 都吃這一色。 */
export type PageHeroTone = "sky" | "orange";

export interface PageHeroProps {
  variant: PageHeroVariant;
  /** 標題本體，h1（預設）或 h2 由 as 決定 */
  title: ReactNode;
  /** 標題上方的小字，photo 變體用大寫字距展開的樣式 */
  eyebrow?: ReactNode;
  description?: ReactNode;
  /** 描述下方的東西：統計列、CTA、錨點連結、瀏覽次數 */
  children?: ReactNode;
  /** photo 變體的背景圖，站內絕對路徑（會自動補 BASE_PATH） */
  image?: string;
  /** photo 變體的第二色，預設 sky */
  tone?: PageHeroTone;
  /** accent 變體的群組色 */
  accent?: AccentName;
  /** accent 變體標題左上方色塊裡的圖示 */
  icon?: ReactNode;
  /** 畫在整個頁首最上方的麵包屑 */
  breadcrumb?: ReactNode;
  as?: "h1" | "h2";
  /**
   * 內容寬，預設 max-w-5xl。
   * 下方內容區用 max-w-4xl 的頁面（專案導讀頁）要跟著改成 "4xl"，
   * 否則桌機上頁首的文字會比內文往左突出 64px，看起來像沒對齊。
   */
  width?: "5xl" | "4xl";
}

const PHOTO_OVERLAY: Record<PageHeroTone, string> = {
  sky: "bg-gradient-to-br from-slate-900/92 via-slate-900/75 to-sky-900/80",
  orange: "bg-gradient-to-br from-slate-900/92 via-slate-900/78 to-orange-900/70",
};

const PHOTO_EYEBROW: Record<PageHeroTone, string> = {
  sky: "text-sky-400",
  orange: "text-orange-400",
};

const ACCENT_SURFACE: Record<AccentName, string> = {
  sky: "bg-gradient-to-b from-sky-50 to-white dark:from-sky-950/60 dark:to-slate-900",
  violet: "bg-gradient-to-b from-violet-50 to-white dark:from-violet-950/60 dark:to-slate-900",
  slate: "bg-gradient-to-b from-slate-100 to-white dark:from-slate-800 dark:to-slate-900",
};

const PADDING: Record<PageHeroVariant, string> = {
  photo: "py-14 sm:py-24",
  accent: "py-10 sm:py-16",
  plain: "py-8 sm:py-12",
};

export default function PageHero({
  variant,
  title,
  eyebrow,
  description,
  children,
  image,
  tone = "sky",
  accent = "slate",
  icon,
  breadcrumb,
  as = "h1",
  width = "5xl",
}: PageHeroProps) {
  const Heading = as;
  const isPhoto = variant === "photo";

  const sectionClass = isPhoto
    ? "relative text-white overflow-hidden"
    : variant === "accent"
      ? `${ACCENT_SURFACE[accent]} border-b border-slate-200 dark:border-slate-800`
      : "bg-white dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800";

  const headingClass = isPhoto
    ? "text-4xl sm:text-5xl font-bold leading-tight text-balance"
    : variant === "accent"
      ? "text-3xl sm:text-4xl font-bold text-slate-800 dark:text-slate-100 leading-tight text-balance"
      : "text-3xl font-bold text-slate-800 dark:text-slate-100 leading-tight text-balance";

  const descriptionClass = isPhoto
    ? "text-slate-300 text-lg leading-relaxed max-w-2xl text-pretty"
    : variant === "accent"
      ? "text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl text-pretty"
      : "text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl text-pretty";

  return (
    <section className={sectionClass}>
      {isPhoto && image && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${BASE_PATH}${image})` }}
          />
          <div className={`absolute inset-0 ${PHOTO_OVERLAY[tone]}`} />
        </>
      )}

      <div
        className={`${width === "4xl" ? "max-w-4xl" : "max-w-5xl"} mx-auto px-4 sm:px-6 ${PADDING[variant]}${isPhoto ? " relative" : ""}`}
      >
        {breadcrumb && (
          <div
            className={`text-sm mb-4 ${isPhoto ? "text-slate-300" : "text-slate-500 dark:text-slate-400"}`}
          >
            {breadcrumb}
          </div>
        )}

        {icon && (
          <div
            className={`w-14 h-14 mb-4 rounded-2xl flex items-center justify-center ${ACCENT[accent].iconBg} ${ACCENT[accent].iconText}`}
          >
            {icon}
          </div>
        )}

        {eyebrow && (
          <div className="mb-4">
            <span
              className={`font-semibold tracking-widest text-sm uppercase whitespace-nowrap ${
                isPhoto ? PHOTO_EYEBROW[tone] : "text-sky-600 dark:text-sky-400"
              }`}
            >
              {eyebrow}
            </span>
          </div>
        )}

        <Heading className={headingClass}>{title}</Heading>

        {description && <p className={`mt-3 ${descriptionClass}`}>{description}</p>}

        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}
