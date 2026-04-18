import type { ServiceError } from "@/server/http";

interface Props {
  title: string;
  error: ServiceError;
}

export function ErrorPanel({ title, error }: Props) {
  return (
    <div className="relative border border-[rgba(235,111,146,0.35)] bg-[rgba(58,25,35,0.6)] p-5">
      <span className="pointer-events-none absolute left-0 top-0 h-[7px] w-[7px] border-l border-t border-[rgba(235,111,146,0.35)]" />
      <span className="pointer-events-none absolute right-0 top-0 h-[7px] w-[7px] border-r border-t border-[rgba(235,111,146,0.35)]" />
      <span className="pointer-events-none absolute bottom-0 left-0 h-[7px] w-[7px] border-b border-l border-[rgba(235,111,146,0.35)]" />
      <span className="pointer-events-none absolute bottom-0 right-0 h-[7px] w-[7px] border-b border-r border-[rgba(235,111,146,0.35)]" />

      <p className="mono mb-2 text-[10px] uppercase tracking-[0.16em] text-[rgba(235,111,146,0.9)]">
        {title}
      </p>
      <p className="m-0 text-[12px] leading-[1.6] text-[rgba(224,222,244,0.85)]">
        {error.message}
      </p>

      {error.details ? (
        <p className="mono mt-3 text-[10px] leading-[1.5] text-[rgba(235,188,186,0.78)]">
          {error.details}
        </p>
      ) : null}
    </div>
  );
}
