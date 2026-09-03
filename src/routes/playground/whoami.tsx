import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { EMPTY_EDGE_INFO, getEdgeInfo } from "@/server/edge/edge";
import { runSource } from "@/server/common/page-data";

const edgeFn = createServerFn({ method: "GET" }).handler(() =>
  runSource(getEdgeInfo),
);

export const Route = createFileRoute("/playground/whoami")({
  head: () => ({
    meta: [
      { title: "whoami | Gorkem Karyol" },
      {
        name: "description",
        content: "What the Cloudflare edge sees about your connection.",
      },
    ],
  }),
  loader: () => edgeFn(),
  component: WhoamiPage,
});

// Label padded with dot leaders to line the values up, sysinfo-style.
function pad(label: string): string {
  return `${label} ${".".repeat(Math.max(3, 15 - label.length))}`;
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex gap-2">
      <span className="shrink-0 text-[#3a3a3a]">{pad(label)}</span>
      <span className="min-w-0 break-all text-[#666]">{value ?? "—"}</span>
    </div>
  );
}

function WhoamiPage() {
  const result = Route.useLoaderData();
  const e = result.ok ? result.data : EMPTY_EDGE_INFO;
  const offEdge = !e.colo && !e.ip;

  const location =
    [e.city, e.region === e.city ? null : e.region, e.country]
      .filter(Boolean)
      .join(", ") || null;
  const coords =
    e.latitude && e.longitude ? `${e.latitude}, ${e.longitude}` : null;
  const network = [e.asn ? `AS${e.asn}` : null, e.isp]
    .filter(Boolean)
    .join(" ") || null;
  const transport =
    [e.httpProtocol, e.tlsVersion].filter(Boolean).join(" over ") || null;

  const rows: Array<[string, string | null]> = [
    ["ip", e.ip],
    [
      "location",
      location ? `${location}${coords ? `  (${coords})` : ""}` : null,
    ],
    ["timezone", e.timezone],
    ["network", network],
    ["edge", e.colo ? `${e.colo}  ·  Cloudflare datacenter` : null],
    ["transport", transport],
    ["cipher", e.tlsCipher],
    ["rtt", e.tcpRttMs != null ? `${e.tcpRttMs} ms to the edge` : null],
    ["agent", e.userAgent],
  ];

  // Print the rows one at a time, sysinfo-style.
  const [shown, setShown] = useState(0);
  const done = shown >= rows.length;

  useEffect(() => {
    if (done) return;
    const t = setTimeout(() => setShown((n) => n + 1), 130);
    return () => clearTimeout(t);
  }, [shown, done]);

  return (
    <div className="mono text-[11px] leading-[2] text-[#555]">
      <p className="text-accent/[0.7]">~$ whoami --verbose</p>

      <div className="mt-4 space-y-0.5">
        {rows.slice(0, shown).map(([label, value]) => (
          <Row key={label} label={label} value={value} />
        ))}
      </div>

      {!done && <span className="animate-pulse text-accent/[0.6]">_</span>}

      {done && offEdge && (
        <p className="mt-4 text-[#3a3a3a]">
          // running off the edge — most fields only populate on the deployed
          Cloudflare worker
        </p>
      )}
    </div>
  );
}
