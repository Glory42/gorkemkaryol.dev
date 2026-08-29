import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  to: "/interests" | "/playground";
  children: ReactNode;
}

export function BackLink({ to, children }: Props) {
  return (
    <div className="mb-6">
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
