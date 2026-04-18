import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { ContactLinks } from "@/components/ui/ContactLinks";
import { RotatingPrompt } from "@/components/ui/RotatingPrompt";
import { TechSpecList } from "@/components/ui/TechSpecList";
import { contactItems, introText, techItems } from "@/lib/content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gorkem Karyol" },
      { name: "description", content: "Personal portfolio of Gorkem Karyol." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <PageShell mainClassName="p-0">
      <div className="opacity-100">
        <div className="relative grid h-[calc(100vh-52px)] grid-cols-1 overflow-hidden">
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            <div className="absolute left-0 right-0 top-[98%] h-px bg-gradient-to-r from-transparent via-[rgba(49,116,143,0.07)] to-transparent" />
          </div>

          <div className="z-[1] grid h-full grid-cols-1 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <section className="flex flex-col justify-center gap-0 overflow-y-auto px-[max(28px,4vw)] py-8 md:border-r md:border-[rgba(64,61,82,0.5)]">
              <div className="mb-5 flex items-center gap-2.5 opacity-100">
                <span className="mono text-[9px] tracking-[0.25em] text-[rgba(49,116,143,0.55)]">
                  /identity
                </span>
                <span className="h-px max-w-12 flex-1 bg-gradient-to-r from-[rgba(49,116,143,0.3)] to-transparent" />
              </div>

              <h1 className="mono mb-1 text-[clamp(38px,5.5vw,72px)] font-bold leading-[0.95] tracking-[-0.02em]">
                <span className="text-[rgb(224,222,244)]">Hi, I am</span>
                <br />
                <span className="text-[rgb(196,167,231)]">Gorkem</span>
              </h1>

              <p className="mono mb-4 text-[11px] tracking-[0.12em] text-[rgba(110,106,134,0.8)]">
                Istanbul, Turkiye
              </p>

              <div className="mb-5 flex flex-wrap items-center gap-[5px] opacity-100">
                <span className="mono text-[12px] text-[rgba(156,207,216,0.75)]">
                  ~$
                </span>
                <RotatingPrompt className="mono min-w-[20ch] text-[12px] text-[rgba(224,222,244,0.8)]" />
              </div>

              <p className="mb-7 mt-0 max-w-[460px] text-[13px] leading-[1.7] text-[rgba(144,140,170,0.9)]">
                {introText}
              </p>

              <section className="opacity-100">
                <h2 className="mono mb-3 text-[9px] tracking-[0.22em] text-[rgba(49,116,143,0.55)]">
                  /contact
                </h2>
                <ContactLinks items={contactItems} />
              </section>
            </section>

            <section className="flex flex-col justify-center overflow-y-auto px-[max(24px,3vw)] py-8">
              <h2 className="mono mb-[18px] text-[9px] tracking-[0.22em] text-[rgba(49,116,143,0.55)]">
                /tech
              </h2>
              <TechSpecList items={techItems} />
            </section>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
