// Skeleton primitives. Caller sets size (h-* / w-* / aspect-*); these fix the
// fill so a page and its pending skeleton stay in step. Line = foreground bar,
// Block = a quieter surface for thumbnails and large panels.

export function SkeletonLine({ className = "" }: { className?: string }) {
  return <div className={`rounded bg-[rgba(255,255,255,0.04)] ${className}`} />;
}

export function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`bg-[rgba(255,255,255,0.03)] ${className}`} />;
}
