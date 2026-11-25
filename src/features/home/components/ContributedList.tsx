import { Link } from "@tanstack/react-router";
import { HomeSection } from "@/features/home/components/HomeSection";
import { manualProjects } from "@/features/projects/manual-projects";

const contributions = manualProjects.flatMap(({ name, contribution }) =>
  contribution ? [{ name, ...contribution }] : [],
);

export function ContributedList() {
  return (
    <HomeSection cmd="ls ~/projects --contributed">
      <div className="stagger flex flex-col gap-5">
        {contributions.map((item) => (
          <p key={item.name} className="text-[14px] leading-[1.7] text-fg-2">
            <Link
              to="/projects/$slug"
              params={{ slug: item.name }}
              className="focus-ring tap-target mono font-bold text-white no-underline hover:text-accent"
            >
              {item.name}
            </Link>
            <span className="mono text-fg-3">
              {" "}
              {item.where} · {item.role}
            </span>
            <br />
            {item.summary}
          </p>
        ))}
      </div>
    </HomeSection>
  );
}
