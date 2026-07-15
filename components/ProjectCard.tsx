import Link from "next/link";
import {
  PROJECT_GROUPS,
  resolveProjectHref,
  projectOpensExternal,
  type Project,
} from "@/lib/projects";
import ProjectIcon from "@/components/ProjectIcon";

const ACCENT = {
  sky: {
    bar: "bg-sky-400",
    iconBg: "bg-sky-50 dark:bg-sky-500/15",
    iconText: "text-sky-700 dark:text-sky-300",
  },
  violet: {
    bar: "bg-violet-400",
    iconBg: "bg-violet-50 dark:bg-violet-500/15",
    iconText: "text-violet-700 dark:text-violet-300",
  },
  slate: {
    bar: "bg-slate-300 dark:bg-slate-500",
    iconBg: "bg-slate-100 dark:bg-slate-700",
    iconText: "text-slate-600 dark:text-slate-300",
  },
} as const;

function accentFor(project: Project) {
  const group = PROJECT_GROUPS.find((g) => g.id === project.group);
  return ACCENT[group?.accent ?? "slate"];
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
      ? "group flex items-center gap-1.5 px-2.5 py-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow"
      : "group flex gap-3 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow";

  const inner =
    variant === "compact" ? (
      <>
        <span className={`inline-flex shrink-0 ${accent.iconText}`}>
          <ProjectIcon name={project.icon} className="w-4 h-4" />
        </span>
        <span className="min-w-0 truncate text-xs font-medium text-slate-800 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
          {project.title}
          {external && <span aria-hidden className="ml-0.5 text-slate-400 text-[10px]">↗</span>}
        </span>
      </>
    ) : (
      <>
        <span className={`w-[3px] shrink-0 rounded ${accent.bar}`} aria-hidden />
        <div className="flex-1">
          <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3 ${accent.iconBg} ${accent.iconText}`}>
            <ProjectIcon name={project.icon} className="w-5 h-5" />
          </span>
          <Heading className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
            {project.title}
            {external && <span aria-hidden className="ml-1 text-slate-400 text-xs">↗</span>}
          </Heading>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            {project.description}
          </p>
          {project.introSlug && (
            <span className="inline-block mt-3 text-xs text-sky-600 dark:text-sky-400">
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
