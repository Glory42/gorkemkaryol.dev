import type { ServiceError } from "@/server/common/http";

// In-place status box, rendered where content would be. `error` = a failed
// upstream, `empty` = a successful-but-blank result, `degraded` = content that
// rendered with a fallback.

interface Props {
  tone: "error" | "empty" | "degraded";
  title?: string;
  description?: string;
  error?: ServiceError;
}

const DEGRADED_MESSAGE =
  "Markdown rendering encountered an issue — showing plain text fallback.";

export function StatusPanel({ tone, title, description, error }: Props) {
  if (tone === "empty") {
    return (
      <div className="panel p-6 text-center">
        <p className="mono text-xs uppercase tracking-[0.14em] text-[var(--text-2)]">
          {title}
        </p>
        <p className="mt-2 text-sm text-[var(--text-3)]">{description}</p>
      </div>
    );
  }

  if (tone === "degraded") {
    return (
      <div className="border border-[rgba(246,193,119,0.3)] bg-[rgba(246,193,119,0.06)] px-4 py-3">
        <p className="mono text-[11px] text-[rgba(246,193,119,0.85)]">
          {description ?? DEGRADED_MESSAGE}
        </p>
      </div>
    );
  }

  return (
    <div className="relative border border-[rgba(235,111,146,0.35)] bg-[rgba(58,25,35,0.6)] p-5">
      <span className="pointer-events-none absolute left-0 top-0 h-[7px] w-[7px] border-l border-t border-[rgba(235,111,146,0.35)]" />
      <span className="pointer-events-none absolute right-0 top-0 h-[7px] w-[7px] border-r border-t border-[rgba(235,111,146,0.35)]" />
      <span className="pointer-events-none absolute bottom-0 left-0 h-[7px] w-[7px] border-b border-l border-[rgba(235,111,146,0.35)]" />
      <span className="pointer-events-none absolute bottom-0 right-0 h-[7px] w-[7px] border-b border-r border-[rgba(235,111,146,0.35)]" />

      <p className="mono mb-2 text-[10px] uppercase tracking-[0.16em] text-[rgba(235,111,146,0.9)]">
        {title}
      </p>
      <p className="m-0 text-[12px] leading-[1.6] text-[rgba(255,255,255,0.75)]">
        {error?.message ?? description}
      </p>
    </div>
  );
}
