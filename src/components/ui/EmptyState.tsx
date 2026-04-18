interface Props {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: Props) {
  return (
    <div className="panel p-6 text-center">
      <p className="mono text-xs uppercase tracking-[0.14em] text-[var(--text-2)]">
        {title}
      </p>
      <p className="mt-2 text-sm text-[var(--text-3)]">{description}</p>
    </div>
  );
}
