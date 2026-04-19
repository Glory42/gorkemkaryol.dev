import { Keyboard, Monitor, MousePointer2 } from "lucide-react";
import type { TechItem } from "@/lib/content";

interface Props {
  items: TechItem[];
}

function iconFor(title: string) {
  const value = title.toLowerCase();
  if (value.includes("mouse")) return MousePointer2;
  if (value.includes("keyboard")) return Keyboard;
  return Monitor;
}

export function TechSpecList({ items }: Props) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => {
        const Icon = iconFor(item.title);

        return (
          <article
            key={`${item.title}-${item.spec}`}
            className="book-card group relative flex gap-[14px] border border-[rgba(64,61,82,0.7)] bg-[rgba(31,29,46,0.4)] px-4 py-[13px]"
          >
            <span className="pointer-events-none absolute left-0 top-0 h-[6px] w-[6px] border-l border-t border-[rgba(49,116,143,0.22)]" />
            <span className="pointer-events-none absolute right-0 top-0 h-[6px] w-[6px] border-r border-t border-[rgba(49,116,143,0.22)]" />
            <span className="pointer-events-none absolute bottom-0 left-0 h-[6px] w-[6px] border-b border-l border-[rgba(49,116,143,0.22)]" />
            <span className="pointer-events-none absolute bottom-0 right-0 h-[6px] w-[6px] border-b border-r border-[rgba(49,116,143,0.22)]" />

            <svg
              className="pointer-events-none absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <rect
                className="book-trace"
                x="0.5"
                y="0.5"
                width="99"
                height="99"
                pathLength="100"
              />
            </svg>

            <div className="mt-[1px] flex w-7 shrink-0 flex-col items-center gap-1">
              <Icon size={13} className="text-[rgba(196,167,231,0.65)]" />
              <span className="mono text-center text-[7px] leading-[1.2] tracking-[0.1em] text-[rgba(110,106,134,0.7)]">
                {item.title}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="mono mb-1 text-[11px] font-semibold tracking-[0.02em] text-[rgba(224,222,244,0.88)] transition-colors duration-200 group-hover:text-[rgb(196,167,231)]">
                {item.spec}
              </h3>
              <p className="m-0 text-[11px] leading-[1.55] text-[rgba(144,140,170,0.8)]">
                {item.description}
              </p>
            </div>
            <span className="absolute bottom-0 left-0 right-0 h-px origin-left scale-x-0 bg-[rgb(196,167,231)] transition-transform duration-200 group-hover:scale-x-100" />
          </article>
        );
      })}
    </div>
  );
}
