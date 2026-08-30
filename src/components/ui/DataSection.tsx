import { Suspense, type ReactNode } from "react";
import { Await } from "@tanstack/react-router";
import { ErrorPanel } from "@/components/ui/ErrorPanel";
import type { ServiceError, ServiceResult } from "@/server/common/http";

interface Props<T> {
  promise: Promise<ServiceResult<T>>;
  fallback: ReactNode;
  children: (data: T) => ReactNode;
  /** Title for the default ErrorPanel; ignored when `renderError` is set. */
  errorTitle?: string;
  /** Custom failure render — replaces the default ErrorPanel. */
  renderError?: (error: ServiceError) => ReactNode;
}

// Suspense + Await + the ok-branch + ErrorPanel in one place. The child only
// ever sees resolved, successful data.
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
        {(result) =>
          result.ok
            ? children(result.data)
            : renderError
              ? renderError(result.error)
              : <ErrorPanel title={errorTitle ?? "Unavailable"} error={result.error} />
        }
      </Await>
    </Suspense>
  );
}
