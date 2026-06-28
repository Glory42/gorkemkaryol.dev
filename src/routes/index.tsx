import { createFileRoute } from "@tanstack/react-router";
import { Code, Globe, Keyboard, Layers, Monitor, Mouse, Terminal } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { ContactLinks } from "@/components/ui/ContactLinks";
import { LiveClock } from "@/components/ui/LiveClock";
import { RotatingPrompt } from "@/components/ui/RotatingPrompt";
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

function iconFor(title: string) {
  const t = title.toLowerCase();
  if (t.includes("mouse")) return Mouse;
  if (t.includes("keyboard")) return Keyboard;
  if (t.includes("os") || t.includes("linux") || t.includes("arch")) return Layers;
  if (t.includes("terminal")) return Terminal;
  if (t.includes("editor")) return Code;
  if (t.includes("browser")) return Globe;
  return Monitor;
}

function HomePage() {
  return (
    <PageShell mainClassName="px-[max(24px,4vw)] pt-3 pb-16 md:pt-[max(24px,4vh)]">
      <div className="mx-auto max-w-[680px]">
      <p className="mono mb-5 text-[11px] text-[#252525]">~$ whoami</p>
      <section className="mb-10">
        <h1 className="mono mb-2 text-[clamp(20px,2.2vw,30px)] font-bold leading-[1.1] tracking-[-0.01em] text-white">
          Görkem Karyol
        </h1>

        <div className="mb-3 flex items-center gap-2.5">
          <span className="mono text-[11px] text-[#444]">Istanbul, Türkiye</span>
          <span className="h-[10px] w-px bg-[rgba(255,255,255,0.07)]" />
          <span className="mono text-[11px] text-[#2e2e2e]">
            <LiveClock
              location="Europe/Istanbul"
              shortName="UTC+3"
              showAt={false}
              timezoneClassName="text-[#252525]"
            />
          </span>
        </div>

        <div className="mb-5 flex items-center gap-2">
          <span className="mono text-[11px] text-[rgba(168,85,247,0.65)]">→</span>
          <span className="inline-flex items-center">
            <RotatingPrompt
              className="mono text-[11px] text-[#555]"
              words={["computer engineering student", "linux enjoyer", "web developer"]}
            />
            <span className="mono text-[11px] text-[rgba(168,85,247,0.55)] animate-pulse">_</span>
          </span>
        </div>

        <p className="mb-5 text-[12px] leading-[1.75] text-[#444]">
          {introText}
        </p>

        <ContactLinks items={contactItems} />
      </section>

      <section>
        <div className="mb-5 flex items-center gap-3">
          <span className="mono text-[9px] tracking-[0.25em] text-[rgba(168,85,247,0.55)] uppercase">
            ./me/setup
          </span>
          <div className="h-px flex-1 bg-[rgba(255,255,255,0.05)]" />
        </div>

        <div className="flex flex-col">
          {techItems.map((item, i) => {
            const Icon = iconFor(item.title);
            return (
              <div key={item.title}>
                <div className="group flex items-center gap-4">
                  <Icon size={13} className="shrink-0 text-[#282828]" />
                  <span className="mono w-[180px] shrink-0 text-[12px] text-[rgba(255,255,255,0.7)] transition-colors duration-150 group-hover:text-[#a855f7]">
                    {item.spec}
                  </span>
                  <span className="mono text-[11px] text-[#333] italic">
                    // {item.description}
                  </span>
                </div>
                {i < techItems.length - 1 && (
                  <div className="my-4 h-px bg-[rgba(255,255,255,0.04)]" />
                )}
              </div>
            );
          })}
        </div>
      </section>
      </div>
    </PageShell>
  );
}
