import type { ReactNode } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { PAGE_MAIN, TerminalPrompt } from "@/components/layout/page";
import { BackLink, type BackLinkTo } from "@/components/ui/BackLink";
import { ResultSection } from "@/components/ui/DataSection";
import type { ServiceResult } from "@/server/common/http";

// The frame every awaited data route shares: the main column, the `~$ cmd`
// prompt line, an optional back-link row, and the ok / error split. A route
// passes a source result and a render fn; DataPage.Skeleton is the same frame
// with a static body for the pending state.

interface FrameProps {
  cmd: string;
  /** Right-aligned on the prompt line (e.g. a count). */
  promptAside?: ReactNode;
  backTo?: BackLinkTo;
  backLabel?: string;
  /** Right-aligned on the back-link row (e.g. an "open on GitHub" link). */
  rightSlot?: ReactNode;
  maxWidth?: number;
  wrapClassName?: string;
  children: ReactNode;
}

// The chrome without a result split — for routes that render several
// independent results (a runSources composite) inside one frame.
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
    <PageShell mainClassName={PAGE_MAIN}>
      <div
        className={`mx-auto min-w-0 ${wrapClassName}`}
        style={{ maxWidth: `${maxWidth}px` }}
      >
        {promptAside ? (
          <div className="mb-4 flex items-center justify-between gap-3">
            <TerminalPrompt cmd={cmd} />
            {promptAside}
          </div>
        ) : (
          <TerminalPrompt cmd={cmd} className="mb-4" />
        )}

        {backTo &&
          (rightSlot ? (
            <div className="mb-4 flex items-center justify-between gap-3">
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
