import type { ReactNode } from "react";

export interface TerminalTabOption<T extends string> {
  id: T;
  label: string;
}

// The site's one segmented tab control: a row of bordered mono buttons with one
// selected. Used for the game and filter switchers.
export function TerminalTabs<T extends string>({
  options,
  value,
  onChange,
  className = "",
}: {
  options: readonly TerminalTabOption<T>[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
}) {
  return (
    <div className={`flex gap-2 ${className}`}>
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={`focus-ring mono border px-4 py-2 text-[9px] tracking-[0.15em] uppercase transition-colors ${
            value === opt.id
              ? "border-accent/[0.5] text-accent"
              : "border-[rgba(255,255,255,0.06)] text-[#3a3a3a] hover:border-accent/[0.3] hover:text-accent/[0.7]"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// A single bordered mono action button (START, a mode pick). `selected` gives
// the accent-on look without needing a hover.
export function TerminalButton({
  onClick,
  selected = false,
  className = "",
  children,
}: {
  onClick: () => void;
  selected?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`focus-ring mono border px-5 py-2 text-[9px] tracking-[0.18em] transition-colors ${
        selected
          ? "border-accent/[0.5] text-accent"
          : "border-accent/[0.4] text-accent/[0.8] hover:border-accent hover:text-accent"
      } ${className}`}
    >
      {children}
    </button>
  );
}
