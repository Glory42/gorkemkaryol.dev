import type { ReactNode } from "react";
import { TerminalButton } from "@/components/ui/TerminalTabs";
import type { GamePhase } from "@/features/playground/useCanvasGame";

// The play area plus the dark overlay shown whenever the game isn't running.
export function GameShell({
  phase,
  overlay,
  children,
}: {
  phase: GamePhase;
  overlay: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="relative select-none">
      {children}
      {phase !== "playing" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[rgba(0,0,0,0.85)]">
          {overlay}
        </div>
      )}
    </div>
  );
}

// Idle / game-over panel; `children` sit above the button, omit `onStart` to bring your own.
export function GameOverlay({
  phase,
  title,
  score,
  hint,
  onStart,
  children,
}: {
  phase: GamePhase;
  title: string;
  score?: number;
  hint: ReactNode;
  onStart?: () => void;
  children?: ReactNode;
}) {
  return (
    <>
      <p className="mono text-[12px] font-bold tracking-[0.15em] text-white">
        {phase === "over" ? "GAME OVER" : title}
      </p>
      {phase === "over" && score != null && (
        <p className="mono text-[10px] text-accent/[0.65]">score — {score}</p>
      )}
      {children}
      {onStart && (
        <TerminalButton onClick={onStart}>
          {phase === "over" ? "RESTART" : "START"}
        </TerminalButton>
      )}
      <p className="mono text-center text-[9px] leading-[1.8] text-fg-4">
        {hint}
      </p>
    </>
  );
}

/** The running score under the play area, once a first run has started. */
export function ScoreLine({ phase, score }: { phase: GamePhase; score: number }) {
  if (phase === "idle") return null;
  return <p className="mono text-[10px] text-accent/[0.6]">score — {score}</p>;
}
