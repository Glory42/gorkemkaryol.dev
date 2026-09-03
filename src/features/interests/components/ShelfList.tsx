import { StatusPanel } from "@/components/ui/StatusPanel";
import { SmartImage } from "@/components/ui/SmartImage";
import type { DisplayItem } from "@/features/interests/display-item";

interface Props {
  items: DisplayItem[];
  emptyTitle: string;
  emptyDescription: string;
}

function ShelfRow({ item, isFirst }: { item: DisplayItem; isFirst: boolean }) {
  const rowClassName = `flex items-center gap-3 pb-3 ${isFirst ? "" : "pt-3"}`;

  const inner = (
    <>
      {item.imageUrl ? (
        <SmartImage
          src={item.imageUrl}
          alt={item.title}
          loading="lazy"
          width={36}
          height={52}
          wrapperClassName="h-[52px] w-[36px] shrink-0"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="h-[52px] w-[36px] shrink-0 bg-[rgba(255,255,255,0.03)]" />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-medium leading-[1.3] text-[rgba(255,255,255,0.8)] transition-colors group-hover:text-accent">
          {item.title}
        </p>
        {item.subtitle && (
          <p className="mt-0.5 text-[10px] text-[#444]">{item.subtitle}</p>
        )}
        {item.progressPercent != null && (
          <div className="mt-1.5 h-[2px] w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.05)]">
            <div
              className="h-full rounded-full bg-accent/[0.45]"
              style={{ width: `${item.progressPercent}%` }}
            />
          </div>
        )}
      </div>
    </>
  );

  if (!item.href) {
    return <div className={rowClassName}>{inner}</div>;
  }

  return (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group no-underline transition-transform hover:-translate-y-px ${rowClassName}`}
    >
      {inner}
    </a>
  );
}

export function ShelfList({ items, emptyTitle, emptyDescription }: Props) {
  if (items.length === 0) {
    return <StatusPanel tone="empty" title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="flex flex-col stagger">
      {items.map((item, i) => (
        <div key={item.id}>
          <ShelfRow item={item} isFirst={i === 0} />
          {i < items.length - 1 && (
            <div className="h-px bg-[rgba(255,255,255,0.04)]" />
          )}
        </div>
      ))}
    </div>
  );
}
