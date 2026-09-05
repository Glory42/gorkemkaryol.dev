import { useEffect, useRef, useState } from "react";
import { readAccentRgb } from "@/lib/accent";
import { sectionAccentRgb } from "@/lib/sections";
import { createGameLoop, type LoopDriver } from "@/features/playground/gameLoop";

export type GamePhase = "idle" | "playing" | "over";

// Owns the ritual every canvas game repeats: the canvas ref, the section accent
// resolved once on mount, the frame loop, and the phase machine. The game keeps
// its own simulation state and hands over `step` / `redraw` that read it.
export function useCanvasGame(opts: {
  driver: LoopDriver;
  tickMs?: number;
  step: (time: number) => void;
  redraw: () => void;
  /** Runs once on mount with the resolved accent, before the first redraw. */
  onAccent?: (accentRgb: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const accentRef = useRef(sectionAccentRgb("playground"));
  const [phase, setPhase] = useState<GamePhase>("idle");

  const stepRef = useRef(opts.step);
  stepRef.current = opts.step;
  const redrawRef = useRef(opts.redraw);
  redrawRef.current = opts.redraw;
  const onAccentRef = useRef(opts.onAccent);
  onAccentRef.current = opts.onAccent;

  const loopRef = useRef(
    createGameLoop({
      driver: opts.driver,
      tickMs: opts.tickMs,
      step: (t) => stepRef.current(t),
    }),
  );

  useEffect(() => {
    const rgb = readAccentRgb(canvasRef.current);
    accentRef.current = rgb;
    onAccentRef.current?.(rgb);
    redrawRef.current();
    const loop = loopRef.current;
    return () => loop.stop();
  }, []);

  function beginPlay(): void {
    setPhase("playing");
    loopRef.current.start();
  }
  function endPlay(): void {
    setPhase("over");
    loopRef.current.stop();
  }

  return { canvasRef, accentRef, phase, beginPlay, endPlay };
}
