import { Link } from "@tanstack/react-router";
import type { SectionHref } from "@/lib/sections";

// Full-page status frame for the router's not-found and error screens.

interface Props {
  variant: "not-found" | "error";
  title?: string;
  message?: string;
  backTo?: SectionHref;
  backLabel?: string;
}

const DEFAULTS = {
  "not-found": {
    eyebrow: "404",
    title: "Route not found",
    message: "The page you requested does not exist.",
  },
  error: {
    eyebrow: "Runtime Error",
    title: "Something broke",
    message: "An unexpected error occurred.",
  },
} as const;

export function StatusPage({
  variant,
  title,
  message,
  backTo = "/",
  backLabel = "Back Home",
}: Props) {
  const preset = DEFAULTS[variant];

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-4xl px-4 pb-16 pt-[90px] md:px-8"
    >
      <section className="panel p-6">
        <p
          className={`mono text-[12px] tracking-[0.15em] ${
            variant === "error"
              ? "text-[rgba(248,113,113,0.85)]"
              : "text-accent/[0.65]"
          }`}
        >
          {preset.eyebrow}
        </p>
        <h1 className="mono mt-2 text-xl text-white">{title ?? preset.title}</h1>
        <p className="mt-3 text-sm text-fg-2">{message ?? preset.message}</p>

        <div className="mt-5">
          <Link
            to={backTo}
            className="focus-ring mono inline-flex items-center border border-[rgba(255,255,255,0.08)] px-3 py-2 text-[11px] uppercase tracking-[0.12em] text-fg-2 no-underline transition-colors hover:text-white"
          >
            {backLabel}
          </Link>
        </div>
      </section>
    </main>
  );
}
