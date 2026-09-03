import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/components/layout/page";

const LINES = [
  "~$ ./sysinfo --verbose",
  "  host ............ portfolio-edge-01",
  "  region ......... auto (nearest PoP)",
  "  uptime ......... 34 days, 02:11:47",
  "  load average ... 0.08, 0.03, 0.01",
  "  memory ......... 41% of 512 MiB",
  "  disk ........... 12% of 10 GiB",
  "  services ....... router, cache, ssr  [ ok ]",
  "  now playing .... resolving track ...",
];

export const Route = createFileRoute("/playground/sysinfo")({
  head: () => pageHead("sysinfo", "System diagnostics."),
  component: SysinfoPage,
});

function SysinfoPage() {
  const [shown, setShown] = useState(0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (shown >= LINES.length) {
      const t = setTimeout(() => setRevealed(true), 700);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setShown((n) => n + 1), 300);
    return () => clearTimeout(t);
  }, [shown]);

  if (!revealed) {
    return (
      <pre className="mono whitespace-pre-wrap text-[11px] leading-[2] text-[#555]">
        {LINES.slice(0, shown).join("\n")}
        <span className="animate-pulse text-accent/[0.6]">_</span>
      </pre>
    );
  }

  return (
    <div>
      <p className="mono mb-4 text-[11px] text-accent/[0.6]">
        // track resolved: never gonna give you up
      </p>
      <div className="relative aspect-video w-full overflow-hidden border border-[rgba(255,255,255,0.06)]">
        <iframe
          className="absolute inset-0 h-full w-full"
          src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&rel=0&playsinline=1"
          title="sysinfo playback"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
      <p className="mono mt-3 text-[10px] text-[#3a3a3a]">
        you have been rickrolled. carry on.
      </p>
    </div>
  );
}
