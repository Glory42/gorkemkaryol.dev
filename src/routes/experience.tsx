import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { ExperienceTimeline } from "@/components/ui/ExperienceTimeline";
import { experiences } from "@/lib/content";

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
    <PageShell mainClassName="px-[max(24px,4vw)] pb-20 pt-[max(12px,1.5vh)]">
      <section className="mx-auto max-w-[900px]">
        <p className="mono mb-6 text-[11px] text-[#252525]">~$ cat ./experience.log</p>
        <div className="mb-2 flex items-center gap-3">
          <span className="mono text-[9px] tracking-[0.25em] text-[rgba(168,85,247,0.55)] uppercase">
            ./experience
          </span>
          <div className="h-px flex-1 bg-[rgba(255,255,255,0.05)]" />
        </div>

        <ExperienceTimeline items={experiences} />
      </section>
    </PageShell>
  );
}
