import {
  ArrowUpRight,
  Code,
  Globe,
  Layers,
  Monitor,
  Terminal,
  type LucideIcon,
} from "lucide-react";
import { HomeSection } from "@/features/home/components/HomeSection";
import { techItems, type TechItem } from "@/features/home/content";

const ICONS: Record<TechItem["iconId"], LucideIcon> = {
  monitor: Monitor,
  layers: Layers,
  code: Code,
  terminal: Terminal,
  globe: Globe,
};

export function SetupList() {
  return (
    <HomeSection cmd="cat ~/.setup">
      <dl className="mono stagger m-0 flex flex-col gap-4 text-[14px]">
        {techItems.map((item) => {
          const Icon = ICONS[item.iconId];
          return (
            <div key={item.title} className="grid gap-x-4 gap-y-0.5 md:grid-cols-[104px_1fr]">
              <dt className="inline-flex items-start gap-2 text-fg-3">
                <Icon size={13} className="mt-[4px] shrink-0" aria-hidden="true" />
                {item.title.toLowerCase()}
              </dt>
              <dd className="m-0">
                {item.href ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="focus-ring tap-target inline-flex items-center gap-1 text-fg-1 no-underline hover:text-accent"
                  >
                    {item.spec} <ArrowUpRight size={12} />
                  </a>
                ) : (
                  <span className="text-fg-1">{item.spec}</span>
                )}
                <span className="block text-[13px] italic text-fg-3"># {item.description}</span>
              </dd>
            </div>
          );
        })}
      </dl>
    </HomeSection>
  );
}
