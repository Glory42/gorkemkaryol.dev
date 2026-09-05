import type { ReactNode } from "react";
import { TerminalButton } from "@/components/ui/TerminalTabs";
import type { GamePhase } from "@/features/playground/useCanvasGame";

// The play-area frame + the dark overlay every game shares. `overlay` is what
// shows while not playing; simple games pass <GameOverlay>, others compose it.
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

// The default idle / game-over panel: title, score line, a start button, a hint.
// `children` slot sits between the score and the button for per-game extras.
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
  onStart: () => void;
  children?: ReactNode;
}) {
  return (
    <>
      <p className="mono text-[11px] font-bold tracking-[0.15em] text-white">
        {phase === "over" ? "GAME OVER" : title}
      </p>
      {phase === "over" && score != null && (
        <p className="mono text-[9px] text-accent/[0.65]">score — {score}</p>
      )}
      {children}
      <TerminalButton onClick={onStart}>
        {phase === "over" ? "RESTART" : "START"}
      </TerminalButton>
      <p className="mono text-center text-[8px] leading-[1.8] text-[#2a2a2a]">
        {hint}
      </p>
    </>
  );
}
