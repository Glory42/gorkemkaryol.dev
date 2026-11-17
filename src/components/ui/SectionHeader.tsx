import type { ReactNode } from "react";
import { Link, type LinkProps } from "@tanstack/react-router";
import { TerminalPrompt } from "@/components/layout/page";

interface Props {
  /** A `./path` label, or with `prompt` the command after a `~$`. */
  label: string;
  prompt?: boolean;
  /** Trailing detail on the label, e.g. a count. */
  meta?: ReactNode;
  /** A "see all" page at the end of the rule; it wraps under the label in narrow columns. */
  more?: LinkProps["to"];
  /** Spacing below; defaults to `mb-4`. */
  className?: string;
}

export function SectionHeader({ label, prompt, meta, more, className = "mb-4" }: Props) {
  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 ${className}`}>
      {prompt ? (
        <TerminalPrompt cmd={label} className="shrink-0" />
      ) : (
        <span className="mono text-[12px] text-accent/[0.75]">
          {label}
          {meta}
        </span>
      )}
      <div className="h-px min-w-[24px] flex-1 bg-[rgba(255,255,255,0.05)]" />
      {more && (
        <Link
          to={more}
          className="focus-ring tap-target mono shrink-0 text-[12px] text-accent/[0.85] no-underline transition-colors hover:text-accent"
        >
          all →
        </Link>
      )}
    </div>
  );
}
