import type { ExperienceItem } from "@/lib/content";

interface Props {
  items: ExperienceItem[];
}

export function ExperienceTimeline({ items }: Props) {
  return (
    <div className="flex flex-col">
      {items.map((item, index) => (
        <div key={`${item.role}-${item.company}`}>
          <div className="group py-5">
            <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-[16px] font-bold leading-[1.25] text-white transition-colors duration-150 group-hover:text-[#a855f7]">
                  {item.role}
                </h3>
                <p className="mono mt-1 text-[12px] text-[rgba(168,85,247,0.75)]">
                  {item.company}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className="mono text-[11px] text-[rgba(168,85,247,0.5)]">{item.date}</span>
                {item.type && (
                  <span className="mono border border-[rgba(168,85,247,0.25)] px-2 py-[2px] text-[8px] tracking-[0.1em] text-[rgba(168,85,247,0.55)]">
                    {item.type}
                  </span>
                )}
              </div>
            </div>

            <ul className="mb-3 ml-0 list-none space-y-[5px] p-0">
              {item.description.map((line) => (
                <li key={line} className="flex items-start gap-3">
                  <span className="mono mt-[3px] shrink-0 text-[11px] text-[#333]">–</span>
                  <span className="text-[13px] leading-[1.65] text-[#555]">{line}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-[5px]">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="mono border border-[rgba(168,85,247,0.22)] px-1.5 py-[2px] text-[8px] tracking-[0.1em] text-[rgba(168,85,247,0.65)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {index < items.length - 1 && (
            <div className="h-px bg-[rgba(255,255,255,0.04)]" />
          )}
        </div>
      ))}
    </div>
  );
}
