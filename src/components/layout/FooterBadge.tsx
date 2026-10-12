import { openCommandPalette } from "@/features/palette/CommandPalette";

export function FooterBadge() {
  return (
    <footer className="mt-10 border-t border-[rgba(255,255,255,0.05)] px-[max(24px,4vw)] py-[18px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-[10px]">
          <span className="h-[3px] w-[3px] bg-accent/[0.3]" />
          <span className="mono text-[10px] tracking-[0.15em] text-accent/[0.6]">
            GORKEM KARYOL
          </span>
          <span className="h-[3px] w-[3px] bg-accent/[0.3]" />
          {/* Unlabelled on purpose: the palette is a little secret. */}
          <button
            type="button"
            onClick={openCommandPalette}
            aria-label="Open command palette"
            className="focus-ring mono ml-1 cursor-pointer text-[10px] tracking-[0.1em] text-fg-4 opacity-60 transition-[color,opacity] duration-300 hover:text-accent hover:opacity-100"
          >
            ^K
          </button>
        </div>

        <a
          className="focus-ring inline-flex items-center gap-[5px] text-[10px] tracking-[0.15em] text-accent/[0.6] no-underline transition-colors hover:text-accent/[0.85]"
          href="https://digitalbeacon.co/report/gorkemkaryol-dev"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="inline-block h-[4px] w-[4px] rounded-full bg-accent/[0.65]" />
          <span className="mono">This visit generated 0.065g of CO2.</span>
        </a>
      </div>
    </footer>
  );
}
