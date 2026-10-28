import { Suspense, type ReactNode } from "react";
import { Await } from "@tanstack/react-router";
import { StatusPanel } from "@/components/ui/StatusPanel";
import type { ServiceError, ServiceResult } from "@/server/common/http";

interface Props<T> {
  promise: Promise<ServiceResult<T>>;
  fallback: ReactNode;
  children: (data: T) => ReactNode;
  /** Title for the default error StatusPanel; ignored when `renderError` is set. */
  errorTitle?: string;
  /** Custom failure render — replaces the default StatusPanel. */
  renderError?: (error: ServiceError) => ReactNode;
}

function renderResult<T>(
  result: ServiceResult<T>,
  children: (data: T) => ReactNode,
  errorTitle?: string,
  renderError?: (error: ServiceError) => ReactNode,
): ReactNode {
  if (result.ok) return children(result.data);
  if (renderError) return renderError(result.error);
  return (
    <StatusPanel
      tone="error"
      title={errorTitle ?? "Unavailable"}
      error={result.error}
    />
  );
}

// Suspense + Await + ok branch + error panel; children only ever see successful data.
export function DataSection<T>({
  promise,
  fallback,
  errorTitle,
  children,
  renderError,
}: Props<T>) {
  return (
    <Suspense fallback={fallback}>
      <Await promise={promise}>
        {(result) => renderResult(result, children, errorTitle, renderError)}
      </Await>
    </Suspense>
  );
}

// DataSection for a result the loader already resolved: same contract, no Suspense.
export function ResultSection<T>({
  result,
  errorTitle,
  children,
  renderError,
}: {
  result: ServiceResult<T>;
  errorTitle?: string;
  children: (data: T) => ReactNode;
  renderError?: (error: ServiceError) => ReactNode;
}) {
  return <>{renderResult(result, children, errorTitle, renderError)}</>;
}
