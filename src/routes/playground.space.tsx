import { Await, createFileRoute, defer } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { env as workerEnv } from "cloudflare:workers";
import { Suspense, useEffect, useState } from "react";
import { ErrorPanel } from "@/components/ui/ErrorPanel";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SmartImage } from "@/components/ui/SmartImage";
import { readRuntimeEnv } from "@/lib/env";
import { publicResult } from "@/server/http";
import { getApod, getNeoFeed, type Apod, type NeoFeed } from "@/server/nasa";

const apodFn = createServerFn({ method: "GET" }).handler(async () =>
  publicResult(await getApod(readRuntimeEnv(workerEnv))),
);
const neoFn = createServerFn({ method: "GET" }).handler(async () =>
  publicResult(await getNeoFeed(readRuntimeEnv(workerEnv))),
);

export const Route = createFileRoute("/playground/space")({
  head: () => ({
    meta: [
      { title: "Space | Gorkem Karyol" },
      {
        name: "description",
        content:
          "NASA's picture of the day and today's near-Earth asteroids.",
      },
    ],
  }),
  loader: () => ({
    apod: defer(apodFn()),
    neo: defer(neoFn()),
  }),
  component: SpacePage,
});

const km = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

function Loading() {
  return (
    <div className="h-40 w-full animate-pulse bg-[rgba(255,255,255,0.03)]" />
  );
}

// The APOD permalink for a given YYYY-MM-DD, e.g. 2026-08-29 -> ap260829.html
function apodPageUrl(date: string): string {
  return `https://apod.nasa.gov/apod/ap${date.slice(2).replace(/-/g, "")}.html`;
}

function ApodLightbox({ apod, onClose }: { apod: Apod; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 bg-black/95 p-6"
      onClick={onClose}
    >
      <img
        src={apod.hdUrl ?? apod.url}
        alt={apod.title}
        className="max-h-[80vh] max-w-full object-contain"
        onClick={(e) => e.stopPropagation()}
      />
      <div
        className="flex items-center gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        <a
          href={apodPageUrl(apod.date)}
          target="_blank"
          rel="noopener noreferrer"
          className="mono text-[11px] text-accent/[0.8] no-underline transition-colors hover:text-accent"
        >
          view on nasa.gov →
        </a>
        <button
          type="button"
          onClick={onClose}
          className="mono text-[11px] text-[#666] transition-colors hover:text-white"
        >
          close ✕
        </button>
      </div>
    </div>
  );
}

function ApodBlock({ apod }: { apod: Apod }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <p className="text-[13px] font-medium text-[rgba(255,255,255,0.85)]">
          {apod.title}
        </p>
        <span className="mono shrink-0 text-[10px] text-[#444]">{apod.date}</span>
      </div>

      {apod.mediaType === "image" ? (
        <button
          type="button"
          aria-label="Open full-size image"
          onClick={() => setOpen(true)}
          className="block w-full cursor-zoom-in border-0 bg-transparent p-0"
        >
          <SmartImage
            src={apod.url}
            alt={apod.title}
            loading="lazy"
            wrapperClassName="w-full bg-[rgba(255,255,255,0.02)]"
            className="mx-auto max-h-[600px] w-auto max-w-full"
          />
        </button>
      ) : apod.thumbnailUrl ? (
        <a href={apod.url} target="_blank" rel="noopener noreferrer" className="block no-underline">
          <SmartImage
            src={apod.thumbnailUrl}
            alt={apod.title}
            loading="lazy"
            wrapperClassName="w-full"
            className="max-h-[520px] w-full object-cover"
          />
          <span className="mono mt-2 inline-block text-[10px] text-accent/[0.7]">
            watch video →
          </span>
        </a>
      ) : (
        <a
          href={apod.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mono text-[11px] text-accent/[0.7]"
        >
          open today's media →
        </a>
      )}

      <p className="mt-4 text-[12px] leading-[1.75] text-[#555]">
        {apod.explanation}
      </p>
      {apod.copyright && (
        <p className="mono mt-2 text-[10px] text-[#3a3a3a]">© {apod.copyright}</p>
      )}

      {open && apod.mediaType === "image" && (
        <ApodLightbox apod={apod} onClose={() => setOpen(false)} />
      )}
    </div>
  );
}

function NeoBlock({ feed }: { feed: NeoFeed }) {
  if (feed.objects.length === 0) {
    return (
      <p className="mono text-[11px] text-[#555]">
        No catalogued near-Earth objects make a close approach today.
      </p>
    );
  }

  return (
    <div>
      <p className="mono mb-3 text-[10px] text-accent/[0.55]">
        {feed.count} tracked · {feed.date}
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-left">
          <thead>
            <tr className="mono text-[9px] tracking-[0.15em] text-[#3a3a3a] uppercase">
              <th className="py-2 pr-4 font-normal">object</th>
              <th className="py-2 pr-4 font-normal">Ø approx (m)</th>
              <th className="py-2 pr-4 font-normal">miss (km)</th>
              <th className="py-2 pr-4 font-normal">lunar</th>
              <th className="py-2 pr-4 font-normal">km/h</th>
              <th className="py-2 font-normal">hazard</th>
            </tr>
          </thead>
          <tbody>
            {feed.objects.map((obj) => (
              <tr
                key={obj.id}
                className="border-t border-[rgba(255,255,255,0.05)] text-[11px] text-[#666]"
              >
                <td className="py-2 pr-4 text-[rgba(255,255,255,0.75)]">{obj.name}</td>
                <td className="mono py-2 pr-4">
                  {km.format(obj.diameterMinM)}–{km.format(obj.diameterMaxM)}
                </td>
                <td className="mono py-2 pr-4">{km.format(obj.missKm)}</td>
                <td className="mono py-2 pr-4">{obj.missLunar.toFixed(1)}</td>
                <td className="mono py-2 pr-4">{km.format(obj.velocityKph)}</td>
                <td className="py-2">
                  {obj.hazardous ? (
                    <span className="text-[rgba(235,111,146,0.9)]">yes</span>
                  ) : (
                    <span className="text-[#3a3a3a]">no</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SpacePage() {
  const { apod, neo } = Route.useLoaderData();

  return (
    <div className="flex flex-col gap-12">
      <section>
        <SectionHeader sig="./space/picture-of-the-day" />
        <Suspense fallback={<Loading />}>
          <Await promise={apod}>
            {(res) =>
              res.ok ? (
                <ApodBlock apod={res.data} />
              ) : (
                <ErrorPanel title="NASA APOD Unavailable" error={res.error} />
              )
            }
          </Await>
        </Suspense>
      </section>

      <section>
        <SectionHeader sig="./space/near-earth-today" />
        <Suspense fallback={<Loading />}>
          <Await promise={neo}>
            {(res) =>
              res.ok ? (
                <NeoBlock feed={res.data} />
              ) : (
                <ErrorPanel title="NeoWs API Unavailable" error={res.error} />
              )
            }
          </Await>
        </Suspense>
      </section>
    </div>
  );
}
