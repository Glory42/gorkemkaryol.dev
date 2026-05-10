export function FooterBadge() {
  return (
    <footer className="mt-10 border-t border-[rgba(255,255,255,0.05)] px-[max(24px,4vw)] py-[18px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-[10px]">
          <span className="h-[3px] w-[3px] bg-[rgba(168,85,247,0.3)]" />
          <span className="mono text-[9px] tracking-[0.15em] text-[rgba(168,85,247,0.5)]">
            GORKEM KARYOL
          </span>
          <span className="h-[3px] w-[3px] bg-[rgba(168,85,247,0.3)]" />
        </div>

        <a
          className="focus-ring inline-flex items-center gap-[5px] text-[9px] tracking-[0.15em] text-[rgba(168,85,247,0.45)] no-underline transition-colors hover:text-[rgba(168,85,247,0.85)]"
          href="https://digitalbeacon.co/report/gorkemkaryol-dev"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="inline-block h-[4px] w-[4px] rounded-full bg-[rgba(168,85,247,0.65)]" />
          <span className="mono">This visit generated 0.063g of CO2.</span>
        </a>
      </div>
    </footer>
  );
}
