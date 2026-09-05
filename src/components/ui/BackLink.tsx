import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

export type BackLinkTo = "/" | "/projects" | "/interests" | "/playground";

interface Props {
  to: BackLinkTo;
  children: ReactNode;
  /** Wrapper classes; defaults to a bottom margin. Pass "" inside a flex row. */
  className?: string;
}

export function BackLink({ to, children, className = "mb-6" }: Props) {
  return (
    <div className={className}>
      <Link
        to={to}
        className="focus-ring mono inline-flex items-center gap-1.5 text-[10px] tracking-[0.1em] text-[#333] no-underline transition-colors hover:text-accent/[0.85]"
      >
        <ChevronLeft size={11} />
        {children}
      </Link>
    </div>
  );
}
