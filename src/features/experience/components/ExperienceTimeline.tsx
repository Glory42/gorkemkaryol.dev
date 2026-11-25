import { CompanyLink } from "@/features/experience/components/CompanyLink";
import type { ExperienceItem } from "@/features/experience/timeline";

interface Props {
  items: ExperienceItem[];
}

export function ExperienceTimeline({ items }: Props) {
  return (
    <ol className="stagger m-0 flex list-none flex-col p-0">
      {items.map((item) => (
        <li
          key={`${item.role}-${item.company}`}
          className="group border-b border-[rgba(255,255,255,0.04)] py-5 last:border-b-0"
        >
          <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-3">
            <div>
              <h3 className="text-[16px] font-bold leading-[1.25] text-white transition-colors duration-150 group-hover:text-accent">
                {item.role}
              </h3>
              <p className="mono mt-1 text-[13px] text-accent/[0.75]">
                <CompanyLink item={item} />
              </p>
            </div>
            <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:gap-1.5">
              <span className="mono text-[12px] text-accent/[0.6]">{item.date}</span>
              {item.type && (
                <span className="mono border border-accent/[0.25] px-2 py-[2px] text-[11px] tracking-[0.04em] text-accent/[0.65]">
                  {item.type}
                </span>
              )}
            </div>
          </div>

          <ul className="mb-3 ml-0 list-none space-y-[5px] p-0">
            {item.description.map((line) => (
              <li key={line} className="flex items-start gap-3">
                <span className="mono mt-[3px] shrink-0 text-[12px] text-fg-4">–</span>
                <span className="text-[13px] leading-[1.65] text-fg-2">{line}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-[5px]">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="mono border border-accent/[0.22] px-1.5 py-[2px] text-[11px] tracking-[0.04em] text-accent/[0.65]"
              >
                {tag}
              </span>
            ))}
          </div>
        </li>
      ))}
    </ol>
  );
}
