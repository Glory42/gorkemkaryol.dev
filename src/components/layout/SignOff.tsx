import { TerminalPrompt } from "@/components/layout/page";
import { CAT_ART } from "@/lib/ascii-cat";

const ART = CAT_ART.join("\n");

export function SignOff({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <pre aria-hidden="true" className="mono m-0 select-none text-[7px] leading-none text-accent/[0.55]">
        {ART}
      </pre>
      <TerminalPrompt cmd="logout" />
    </div>
  );
}
