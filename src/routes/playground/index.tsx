import { createFileRoute, Link } from "@tanstack/react-router";
import { pageHead } from "@/components/layout/page";
import { playgroundEntries } from "@/features/playground/registry";

export const Route = createFileRoute("/playground/")({
  head: () =>
    pageHead("Playground", "Games, a NASA data page, and other small web toys."),
  component: PlaygroundHub,
});

function PlaygroundHub() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {playgroundEntries.map((entry) => {
        const Icon = entry.icon;
        const card = (
          <div className="flex h-full flex-col gap-2 border border-[rgba(255,255,255,0.06)] p-5 transition-colors duration-150 group-hover:border-accent/[0.3]">
            <div className="flex items-center gap-2.5">
              <Icon size={13} className="shrink-0 text-accent/[0.7]" />
              <span className="mono text-[13px] tracking-[0.05em] text-[rgba(255,255,255,0.8)] transition-colors group-hover:text-accent">
                {entry.title}
              </span>
              {entry.status === "soon" && (
                <span className="mono ml-auto text-[9px] tracking-[0.2em] text-fg-3 uppercase">
                  soon
                </span>
              )}
            </div>
            <p className="text-[12px] leading-[1.6] text-fg-2">{entry.blurb}</p>
          </div>
        );

        if (entry.status === "soon" || !entry.href) {
          return (
            <div key={entry.slug} className="pointer-events-none opacity-40">
              {card}
            </div>
          );
        }

        return (
          <Link key={entry.slug} to={entry.href} className="group no-underline">
            {card}
          </Link>
        );
      })}
    </div>
  );
}
