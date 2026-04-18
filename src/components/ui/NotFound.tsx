import { Link } from "@tanstack/react-router";

export function NotFound() {
  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-4xl px-4 pb-16 pt-[90px] md:px-8"
    >
      <section className="panel p-6">
        <p className="mono text-[11px] tracking-[0.15em] text-[rgba(49,116,143,0.85)]">
          404
        </p>
        <h1 className="mono mt-2 text-xl text-[rgb(224,222,244)]">
          Route not found
        </h1>
        <p className="mt-3 text-sm text-[rgba(144,140,170,0.9)]">
          The page you requested does not exist.
        </p>

        <div className="mt-5">
          <Link
            to="/"
            className="focus-ring mono inline-flex items-center border border-[rgba(64,61,82,0.9)] px-3 py-2 text-[10px] uppercase tracking-[0.12em] no-underline"
          >
            Back Home
          </Link>
        </div>
      </section>
    </main>
  );
}
