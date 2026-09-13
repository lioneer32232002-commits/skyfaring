import Link from "next/link";
import {
  resolveProjectHref,
  projectOpensExternal,
  type Project,
} from "@/lib/projects";
import { accentFor } from "@/lib/projectAccent";
import ProjectIcon from "@/components/ProjectIcon";

/**
 * 標題末字與外連箭頭綁在同一個 nowrap 片段裡，
 * 否則標題折行時箭頭會自己掉到下一行變成孤字。
 * 箭頭刻意不另外縮字級（只用淺色弱化）：字級一小，它的行內盒就跟標題文字差幾個 px，
 * scripts/check-layout.mjs 的孤字偵測會把同一行判成兩行、報成假的箭頭孤字。
 */
function titleWithArrow(title: string, arrowClass: string) {
  return (
    <>
      {title.slice(0, -1)}
      <span className="whitespace-nowrap">
        {title.slice(-1)}
        <span aria-hidden className={arrowClass}>
          ↗
        </span>
      </span>
    </>
  );
}

export default function ProjectCard({
  project,
  variant = "full",
  headingAs = "h3",
}: {
  project: Project;
  variant?: "full" | "compact";
  headingAs?: "h2" | "h3";
}) {
  const accent = accentFor(project);
  const href = resolveProjectHref(project);
  const external = projectOpensExternal(project);
  const Heading = headingAs as "h2" | "h3";

  const className =
    variant === "compact"
      ? "group flex items-start gap-1.5 px-2.5 py-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow"
      : "group flex gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow";

  const inner =
    variant === "compact" ? (
      <>
        <span className={`inline-flex shrink-0 mt-0.5 ${accent.iconText}`}>
          <ProjectIcon name={project.icon} className="w-4 h-4" />
        </span>
        <span className="min-w-0 text-[13px] leading-snug text-balance font-medium text-slate-800 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
          {external
            ? titleWithArrow(project.title, "ml-0.5 text-slate-400")
            : project.title}
        </span>
      </>
    ) : (
      <>
        <span className={`w-[3px] shrink-0 rounded ${accent.bar}`} aria-hidden />
        <div className="flex-1">
          <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3 ${accent.iconBg} ${accent.iconText}`}>
            <ProjectIcon name={project.icon} className="w-5 h-5" />
          </span>
          <Heading className="font-semibold text-balance text-slate-800 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
            {external
              ? titleWithArrow(project.title, "ml-1 text-slate-400")
              : project.title}
          </Heading>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed text-pretty">
            {project.description}
          </p>
          {project.introSlug && (
            <span className="inline-block mt-3 text-[13px] whitespace-nowrap text-sky-600 dark:text-sky-400">
              看專案導讀 →
            </span>
          )}
        </div>
      </>
    );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${project.title}（在新分頁開啟）`}
        className={className}
      >
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {inner}
    </Link>
  );
}
