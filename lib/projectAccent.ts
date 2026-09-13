import { PROJECT_GROUPS, type Project, type ProjectGroupId } from "@/lib/projects";

/**
 * 專案分組的顏色對照。
 * 專案卡（components/ProjectCard.tsx）與專案導讀頁（app/projects/[slug]/page.tsx）
 * 共用同一份，避免兩邊各留一份色票之後改到不同步。
 */
export const ACCENT = {
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

export type Accent = (typeof ACCENT)[keyof typeof ACCENT];

export function accentFor(project: Project): Accent {
  return accentForGroup(project.group);
}

/** 只知道 group id 時用這個（例如導讀頁從 PROJECTS 反查到專案之後取色）。 */
export function accentForGroup(groupId: ProjectGroupId | undefined): Accent {
  const group = PROJECT_GROUPS.find((g) => g.id === groupId);
  return ACCENT[group?.accent ?? "slate"];
}
