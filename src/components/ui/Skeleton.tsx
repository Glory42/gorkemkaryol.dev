// Skeleton primitives: callers set size; Line is a foreground bar, Block a quieter surface.

export function SkeletonLine({ className = "" }: { className?: string }) {
  return <div className={`rounded bg-[rgba(255,255,255,0.04)] ${className}`} />;
}

export function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`bg-[rgba(255,255,255,0.03)] ${className}`} />;
}
