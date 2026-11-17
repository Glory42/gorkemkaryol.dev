import { ArrowUpRight } from "lucide-react";
import type { ExperienceItem } from "@/features/experience/timeline";

export function CompanyLink({ item, className = "" }: { item: ExperienceItem; className?: string }) {
  if (!item.url) return <span className={className}>{item.company}</span>;
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`focus-ring tap-target group/company inline-flex items-center gap-1 no-underline transition-colors hover:text-accent ${className}`}
    >
      {item.company}
      <ArrowUpRight
        size={11}
        aria-hidden="true"
        className="shrink-0 opacity-40 transition-opacity group-hover/company:opacity-100"
      />
    </a>
  );
}
