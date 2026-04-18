import type { ExperienceItem } from "@/lib/content";

interface Props {
  items: ExperienceItem[];
}

export function ExperienceTimeline({ items }: Props) {
  return (
    <div className="relative">
      <div className="absolute bottom-0 left-[11px] top-0 w-px bg-gradient-to-b from-[rgba(49,116,143,0.4)] to-[rgba(49,116,143,0.03)]" />

      <div className="flex flex-col gap-[18px]">
        {items.map((item, index) => {
          const expId = String(index + 1).padStart(3, "0");

          return (
            <div key={`${item.role}-${item.company}`} className="flex gap-5">
              <div className="mt-[6px] shrink-0">
                <div className="flex h-6 w-6 items-center justify-center border border-[rgba(49,116,143,0.45)] bg-[rgb(25,23,36)]">
                  <span className="h-[6px] w-[6px] bg-[rgb(49,116,143)]" />
                </div>
              </div>

              <article className="group relative flex-1 border border-[rgba(64,61,82,0.8)] bg-[rgba(31,29,46,0.5)] px-[22px] py-5">
                <span className="pointer-events-none absolute left-0 top-0 h-[6px] w-[6px] border-l border-t border-[rgba(49,116,143,0.22)]" />
                <span className="pointer-events-none absolute right-0 top-0 h-[6px] w-[6px] border-r border-t border-[rgba(49,116,143,0.22)]" />
                <span className="pointer-events-none absolute bottom-0 left-0 h-[6px] w-[6px] border-b border-l border-[rgba(49,116,143,0.22)]" />
                <span className="pointer-events-none absolute bottom-0 right-0 h-[6px] w-[6px] border-b border-r border-[rgba(49,116,143,0.22)]" />

                <div className="mb-4 flex flex-wrap items-start justify-between gap-[10px]">
                  <div>
                    <p className="mono mb-[5px] text-[8px] tracking-[0.15em] text-[rgba(110,106,134,0.65)]">
                      EXP-{expId}
                    </p>
                    <h3 className="mono mb-1 text-[14px] font-semibold leading-[1.3] tracking-[0.03em] text-[rgb(224,222,244)]">
                      {item.role}
                    </h3>
                    <p className="mono m-0 text-[11px] text-[rgba(156,207,216,0.8)]">
                      {item.company}
                    </p>
                  </div>

                  <p className="mono shrink-0 self-start whitespace-nowrap border border-[rgba(64,61,82,0.9)] bg-[rgba(38,35,58,0.3)] px-[9px] py-1 text-[9px] tracking-[0.1em] text-[rgba(110,106,134,0.7)]">
                    {item.date}
                  </p>
                </div>

                <ul className="mb-4 ml-0 list-none p-0">
                  {item.description.map((line) => (
                    <li key={line} className="mb-[7px] flex items-start gap-[10px]">
                      <span className="mono mt-[2px] shrink-0 text-[10px] text-[rgba(49,116,143,0.55)]">
                        ›
                      </span>
                      <span className="text-[12px] leading-[1.6] text-[rgba(144,140,170,0.88)]">
                        {line}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-[5px]">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="mono border border-[rgba(49,116,143,0.2)] px-1.5 py-[2px] text-[8px] tracking-[0.1em] text-[rgba(49,116,143,0.75)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="absolute bottom-0 left-0 right-0 h-px origin-left scale-x-0 bg-[rgb(196,167,231)] transition-transform duration-200 group-hover:scale-x-100" />
              </article>
            </div>
          );
        })}
      </div>
    </div>
  );
}
