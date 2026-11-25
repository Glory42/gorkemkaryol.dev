import type { ReactNode } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { TerminalPrompt } from "@/components/layout/page";
import { BackLink } from "@/components/ui/BackLink";
import type { SectionHref } from "@/lib/sections";
import { ResultSection } from "@/components/ui/DataSection";
import type { ServiceResult } from "@/server/common/http";

interface FrameProps {
  cmd: string;
  /** Right-aligned on the prompt line (e.g. a count). */
  promptAside?: ReactNode;
  backTo?: SectionHref;
  backLabel?: string;
  /** Right-aligned on the back-link row (e.g. an "open on GitHub" link). */
  rightSlot?: ReactNode;
  maxWidth?: number;
  wrapClassName?: string;
  children: ReactNode;
}

// The frame without a result split, for routes that render several results (runSources).
export function PageFrame(props: FrameProps) {
  return <Frame {...props} />;
}

function Frame({
  cmd,
  promptAside,
  backTo,
  backLabel = "back",
  rightSlot,
  maxWidth = 900,
  wrapClassName = "",
  children,
}: FrameProps) {
  return (
    <PageShell>
      <div className={`mx-auto min-w-0 ${wrapClassName}`} style={{ maxWidth: `${maxWidth}px` }}>
        {promptAside ? (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <TerminalPrompt cmd={cmd} />
            {promptAside}
          </div>
        ) : (
          <TerminalPrompt cmd={cmd} className="mb-4" />
        )}

        {backTo &&
          (rightSlot ? (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <BackLink to={backTo} className="">
                {backLabel}
              </BackLink>
              {rightSlot}
            </div>
          ) : (
            <BackLink to={backTo}>{backLabel}</BackLink>
          ))}

        {children}
      </div>
    </PageShell>
  );
}

type DataPageProps<T> = Omit<FrameProps, "children" | "rightSlot"> & {
  result: ServiceResult<T>;
  errorTitle?: string;
  /** A node, or a fn of the resolved data (rendered only when the result is ok). */
  rightSlot?: ReactNode | ((data: T) => ReactNode);
  children: (data: T) => ReactNode;
};

export function DataPage<T>({
  result,
  errorTitle,
  rightSlot,
  children,
  ...frame
}: DataPageProps<T>) {
  const resolvedRight =
    typeof rightSlot === "function"
      ? result.ok
        ? (rightSlot as (data: T) => ReactNode)(result.data)
        : null
      : rightSlot;

  return (
    <Frame {...frame} rightSlot={resolvedRight}>
      <ResultSection result={result} errorTitle={errorTitle}>
        {children}
      </ResultSection>
    </Frame>
  );
}

// Same frame, static body — for a route's pendingComponent.
DataPage.Skeleton = PageFrame;
