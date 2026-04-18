import type { FavoriteItem } from "@/lib/content";

interface Props {
  items: FavoriteItem[];
}

export function FavoriteGrid({ items }: Props) {
  return (
    <div className="grid max-w-[800px] grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-2">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <article
            key={`${item.label}-${item.value}`}
            className="group relative border border-[rgba(64,61,82,0.7)] bg-[rgba(31,29,46,0.45)] px-[18px] py-[15px]"
          >
            <span className="pointer-events-none absolute left-0 top-0 h-[6px] w-[6px] border-l border-t border-[rgba(235,188,186,0.2)]" />
            <span className="pointer-events-none absolute right-0 top-0 h-[6px] w-[6px] border-r border-t border-[rgba(235,188,186,0.2)]" />
            <span className="pointer-events-none absolute bottom-0 left-0 h-[6px] w-[6px] border-b border-l border-[rgba(235,188,186,0.2)]" />
            <span className="pointer-events-none absolute bottom-0 right-0 h-[6px] w-[6px] border-b border-r border-[rgba(235,188,186,0.2)]" />

            <p className="mono mb-[7px] flex items-center gap-1.5 text-[8px] tracking-[0.18em] text-[rgba(235,188,186,0.55)]">
              <Icon size={11} />
              {item.label}
            </p>
            <p className="mono text-[12px] font-semibold leading-[1.35] text-[rgba(224,222,244,0.88)]">
              {item.value}
            </p>
            <span className="absolute bottom-0 left-0 right-0 h-px origin-left scale-x-0 bg-[rgb(196,167,231)] transition-transform duration-200 group-hover:scale-x-100" />
          </article>
        );
      })}
    </div>
  );
}
