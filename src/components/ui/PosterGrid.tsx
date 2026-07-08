import { EmptyState } from "@/components/ui/EmptyState";
import { SmartImage } from "@/components/ui/SmartImage";

export interface PosterGridItem {
  id: string | number;
  title: string;
  subtitle?: string | null;
  imageUrl: string | null;
  href: string;
  progressPercent?: number;
}

interface Props {
  items: PosterGridItem[];
  emptyTitle: string;
  emptyDescription: string;
}

export function PosterGrid({ items, emptyTitle, emptyDescription }: Props) {
  if (items.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="grid grid-cols-3 gap-x-4 gap-y-6 stagger sm:grid-cols-4 md:grid-cols-5">
      {items.map((item) => (
        <a
          key={item.id}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group block no-underline transition-transform hover:-translate-y-px"
        >
          {item.imageUrl ? (
            <SmartImage
              src={item.imageUrl}
              alt={item.title}
              loading="lazy"
              width={100}
              height={150}
              wrapperClassName="aspect-[2/3] w-full"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="aspect-[2/3] w-full bg-[rgba(255,255,255,0.03)]" />
          )}
          <p className="mt-2 text-[11px] font-medium leading-[1.3] text-[rgba(255,255,255,0.8)] transition-colors group-hover:text-[#a855f7]">
            {item.title}
          </p>
          {item.subtitle && (
            <p className="mt-0.5 text-[10px] text-[#444]">{item.subtitle}</p>
          )}
          {item.progressPercent !== undefined && (
            <div className="mt-1.5 h-[2px] w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.05)]">
              <div
                className="h-full rounded-full bg-[rgba(168,85,247,0.45)]"
                style={{ width: `${item.progressPercent}%` }}
              />
            </div>
          )}
        </a>
      ))}
    </div>
  );
}

export function PosterGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-4 md:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <div className="image-shimmer aspect-[2/3] w-full" />
          <div className="mt-2 h-2.5 w-[85%] rounded bg-[rgba(255,255,255,0.04)]" />
          <div className="mt-1.5 h-2 w-1/2 rounded bg-[rgba(255,255,255,0.03)]" />
        </div>
      ))}
    </div>
  );
}
