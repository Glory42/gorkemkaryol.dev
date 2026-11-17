import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { pageHead, TerminalPrompt } from "@/components/layout/page";
import { ExperienceTimeline } from "@/features/experience/components/ExperienceTimeline";
import { volunteeringExperiences, workExperiences } from "@/features/experience/timeline";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const Route = createFileRoute("/experience")({
  head: () =>
    pageHead("Experience", "Work and community timeline of Gorkem Karyol.", "/experience"),
  component: ExperiencePage,
});

function ExperiencePage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-[900px]">
        <TerminalPrompt cmd="ls ./experience" className="mb-6" />

        <SectionHeader label="./experience/work" className="mb-2" />
        <ExperienceTimeline items={workExperiences} />

        <SectionHeader label="./experience/volunteering" className="mb-2 mt-10" />
        <ExperienceTimeline items={volunteeringExperiences} />
      </section>
    </PageShell>
  );
}
