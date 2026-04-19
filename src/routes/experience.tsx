import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { ExperienceTimeline } from "@/components/ui/ExperienceTimeline";
import { experiences, skillGroups } from "@/lib/content";

export const Route = createFileRoute("/experience")({
  head: () => ({
    meta: [
      { title: "Experience | Gorkem Karyol" },
      {
        name: "description",
        content: "Work and community timeline of Gorkem Karyol.",
      },
    ],
  }),
  component: ExperiencePage,
});

function ExperiencePage() {
  return (
    <PageShell mainClassName="px-[max(24px,4vw)] pb-20 pt-[max(20px,2.5vh)]">
      <section>
        <header className="mb-12 flex flex-col gap-8 opacity-100 lg:flex-row lg:items-start lg:justify-between">
          <div className="shrink-0">
            <div className="mb-2">
              <span className="mono text-[9px] tracking-[0.25em] text-[rgba(49,116,143,0.5)]">
                /experience
              </span>
            </div>
            <h1 className="mono m-0 mb-[6px] text-[clamp(26px,5vw,44px)] font-bold tracking-[-0.01em] text-[rgb(224,222,244)]">
              EXPERIENCE
            </h1>
            <p className="m-0 mt-0 max-w-[460px] text-[13px] leading-[1.65] text-[rgba(144,140,170,0.8)]">
              Professional roles, community involvement, and the work that shaped
              my thinking.
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:mt-8">
            {skillGroups.map((group) => (
              <div key={group.category} className="flex items-start gap-4">
                <span className="mono w-[90px] shrink-0 pt-[3px] text-[8px] tracking-[0.15em] text-[rgba(196,167,231,0.5)] uppercase">
                  {group.category}
                </span>
                <div className="flex flex-wrap gap-[5px]">
                  {group.skills.map((skill) => (
                    <span
                      key={skill}
                      className="mono border border-[rgba(196,167,231,0.2)] px-1.5 py-[2px] text-[8px] tracking-[0.1em] text-[rgba(196,167,231,0.75)]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </header>

        <section>
          <div className="mb-10 flex items-center gap-4">
            <span className="mono text-[10px] tracking-[0.2em] text-[rgba(49,116,143,0.5)]">
              EXP.01
            </span>
            <div className="h-px w-10 bg-gradient-to-r from-[rgba(49,116,143,0.45)] to-transparent" />
            <h2 className="mono m-0 text-[11px] font-normal uppercase tracking-[0.25em] text-[rgba(224,222,244,0.75)]">
              Work Log
            </h2>
            <div className="h-px flex-1 bg-[rgba(64,61,82,0.8)]" />
          </div>

          <ExperienceTimeline items={experiences} />
        </section>
      </section>
    </PageShell>
  );
}
