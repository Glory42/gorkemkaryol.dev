export function FooterBadge() {
  return (
    <footer className="mt-10 border-t border-[rgba(64,61,82,0.5)] px-[max(24px,4vw)] py-[18px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-[10px]">
          <span className="h-[3px] w-[3px] bg-[rgba(196,167,231,0.4)]" />
          <span className="mono text-[9px] tracking-[0.15em] text-[rgba(110,106,134,0.65)]">
            GORKEM KARYOL
          </span>
          <span className="h-[3px] w-[3px] bg-[rgba(196,167,231,0.4)]" />
        </div>

        <a
          className="focus-ring inline-flex items-center gap-[5px] text-[9px] tracking-[0.15em] text-[rgba(156,207,216,0.5)] no-underline transition-colors hover:text-[rgba(156,207,216,0.85)]"
          href="https://www.websitecarbon.com/website/gorkemkaryol-dev/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="inline-block h-[4px] w-[4px] rounded-full bg-[rgb(156,207,216)]" />
          <span className="mono">This visit generated 0.01g of CO2.</span>
        </a>
      </div>
    </footer>
  );
}
