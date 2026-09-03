import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { PAGE_MAIN, pageHead, TerminalPrompt } from "@/components/layout/page";
import { ExperienceTimeline } from "@/features/experience/components/ExperienceTimeline";
import { volunteeringExperiences, workExperiences } from "@/features/experience/timeline";

export const Route = createFileRoute("/experience")({
  head: () =>
    pageHead("Experience", "Work and community timeline of Gorkem Karyol."),
  component: ExperiencePage,
});

function ExperiencePage() {
  return (
    <PageShell mainClassName={PAGE_MAIN}>
      <section className="mx-auto max-w-[900px]">
        <TerminalPrompt cmd="ls ./experience" className="mb-6" />

        <div className="mb-2 flex items-center gap-3">
          <span className="mono text-[9px] tracking-[0.25em] text-accent/[0.4] uppercase">
            ./experience/work
          </span>
          <div className="h-px flex-1 bg-[rgba(255,255,255,0.04)]" />
        </div>
        <ExperienceTimeline items={workExperiences} />

        <div className="mb-2 mt-10 flex items-center gap-3">
          <span className="mono text-[9px] tracking-[0.25em] text-accent/[0.4] uppercase">
            ./experience/volunteering
          </span>
          <div className="h-px flex-1 bg-[rgba(255,255,255,0.04)]" />
        </div>
        <ExperienceTimeline items={volunteeringExperiences} />
      </section>
    </PageShell>
  );
}
