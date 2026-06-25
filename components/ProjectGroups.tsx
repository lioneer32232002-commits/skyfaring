import { getGroupedProjects } from "@/lib/projects";
import ProjectCard from "@/components/ProjectCard";

const DOT: Record<"sky" | "violet" | "slate", string> = {
  sky: "bg-sky-400",
  violet: "bg-violet-400",
  slate: "bg-slate-400",
};

export default function ProjectGroups({
  variant,
  groupAs,
}: {
  variant: "full" | "compact";
  groupAs: "h2" | "h3";
}) {
  const groups = getGroupedProjects();
  const GroupHeading = groupAs as "h2" | "h3";

  const gridClass =
    variant === "compact"
      ? "grid grid-cols-2 sm:grid-cols-3 gap-3"
      : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4";

  return (
    <div className="space-y-10">
      {groups.map(({ group, projects }) => (
        <section key={group.id}>
          <div className="flex items-center gap-2.5 mb-4">
            <span className={`w-2 h-2 rounded-sm shrink-0 ${DOT[group.accent]}`} aria-hidden />
            <GroupHeading className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              {group.label}
            </GroupHeading>
            <span className="flex-1 h-px bg-slate-200 dark:bg-slate-700" aria-hidden />
          </div>
          <div className={gridClass}>
            {projects.map((project) => (
              <ProjectCard
                key={project.title}
                project={project}
                variant={variant}
                headingAs="h3"
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
