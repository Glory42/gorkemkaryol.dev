import { Link } from "@tanstack/react-router";
import type { SectionHref } from "@/lib/sections";

// Full-page frame for the router's runtime-error screen; 404s use NotFoundPage.

interface Props {
  title?: string;
  message?: string;
  backTo?: SectionHref;
  backLabel?: string;
}

export function StatusPage({
  title = "Something broke",
  message = "An unexpected error occurred.",
  backTo = "/",
  backLabel = "Back Home",
}: Props) {
  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-4xl px-4 pb-16 pt-[90px] md:px-8"
    >
      <section className="panel p-6">
        <p className="mono text-[12px] tracking-[0.15em] text-[rgba(248,113,113,0.85)]">
          Runtime Error
        </p>
        <h1 className="mono mt-2 text-xl text-white">{title}</h1>
        <p className="mt-3 text-sm text-fg-2">{message}</p>

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
