import { useEffect, useRef, useState } from "react";
import { readAccentRgb } from "@/lib/accent";
import { sectionAccentRgb } from "@/lib/sections";
import { createGameLoop, type LoopDriver } from "@/features/playground/gameLoop";

export type GamePhase = "idle" | "playing" | "over";

type Hud = Record<string, number>;

function sameHud(a: Hud, b: Hud): boolean {
  return Object.keys(b).every((key) => a[key] === b[key]);
}

// Owns what every canvas game repeats: canvas, accent, loop, phase, death and the HUD.
export function useCanvasGame<H extends Hud>(opts: {
  driver: LoopDriver;
  tickMs?: number;
  /** Advance one frame of the simulation; return "over" to end the run. */
  step: (time: number) => "over" | void;
  redraw: () => void;
  /** The numbers the page shows (score, …), re-read after every step. */
  hud: () => H;
  /** Runs once on mount with the resolved accent, before the first redraw. */
  onAccent?: (accentRgb: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const accentRef = useRef(sectionAccentRgb("playground"));
  const aliveRef = useRef(false);
  const [phase, setPhase] = useState<GamePhase>("idle");
  const [hud, setHud] = useState<H>(opts.hud);

  const optsRef = useRef(opts);
  optsRef.current = opts;

  function refresh(): void {
    optsRef.current.redraw();
    const next = optsRef.current.hud();
    setHud((prev) => (sameHud(prev, next) ? prev : next));
  }

  function die(): void {
    aliveRef.current = false;
    loopRef.current.stop();
    setPhase("over");
    refresh();
  }

  const loopRef = useRef(
    createGameLoop({
      driver: opts.driver,
      tickMs: opts.tickMs,
      step: (t) => {
        if (!aliveRef.current) return;
        if (optsRef.current.step(t) === "over") die();
        else refresh();
      },
    }),
  );

  useEffect(() => {
    const rgb = readAccentRgb(canvasRef.current);
    accentRef.current = rgb;
    optsRef.current.onAccent?.(rgb);
    optsRef.current.redraw();
    const loop = loopRef.current;
    return () => loop.stop();
  }, []);

  // `reset` puts the simulation back to its first frame before play resumes.
  function start(reset: () => void): void {
    reset();
    aliveRef.current = true;
    setPhase("playing");
    loopRef.current.start();
    refresh();
    canvasRef.current?.focus();
  }

  return {
    canvasRef,
    accentRef,
    phase,
    hud,
    /** True between start() and death; read it in input handlers. */
    playing: () => aliveRef.current,
    start,
    die,
    refresh,
  };
}
