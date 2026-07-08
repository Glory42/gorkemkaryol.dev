interface Props {
  sig: string;
}

export function SectionHeader({ sig }: Props) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="mono text-[9px] tracking-[0.25em] text-[rgba(168,85,247,0.55)] uppercase">
        {sig}
      </span>
      <div className="h-px flex-1 bg-[rgba(255,255,255,0.05)]" />
    </div>
  );
}
