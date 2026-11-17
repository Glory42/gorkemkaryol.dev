import type { ReactNode } from "react";
import type { LinkProps } from "@tanstack/react-router";
import { SectionHeader } from "@/components/ui/SectionHeader";

interface HeadingProps {
  cmd: string;
  /** A "see all" page, shown at the right end of the rule. */
  more?: LinkProps["to"];
}

// `home-heading` and `home-stack` (app.css) own the gaps, so call sites carry no spacing.
export function HomeHeading({ cmd, more }: HeadingProps) {
  return <SectionHeader prompt label={cmd} more={more} className="home-heading" />;
}

export function HomeSection({ children, ...heading }: HeadingProps & { children: ReactNode }) {
  return (
    <section>
      <HomeHeading {...heading} />
      {children}
    </section>
  );
}
