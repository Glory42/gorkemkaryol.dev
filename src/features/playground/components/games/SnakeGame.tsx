import { useRef, useState } from "react";
import { TerminalButton } from "@/components/ui/TerminalTabs";
import {
  GameOverlay,
  GameShell,
  ScoreLine,
} from "@/features/playground/components/GameShell";
import {
  COLS,
  newSnake,
  ROWS,
  stepSnake,
  turn,
  type Dir,
  type Mode,
} from "@/features/playground/snake-logic";
import { useCanvasGame } from "@/features/playground/useCanvasGame";

const CELL = 15;
const W = COLS * CELL, H = ROWS * CELL;
const TICK_MS = 110;

const KEY_DIRS: Record<string, Dir> = {
  ArrowUp: "U", ArrowDown: "D", ArrowLeft: "L", ArrowRight: "R",
  w: "U", s: "D", a: "L", d: "R",
};

export function SnakeGame() {
  const game = useRef(newSnake("walls"));
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const [mode, setMode] = useState<Mode>("walls");

  const { canvasRef, accentRef, phase, hud, start } = useCanvasGame({
    driver: "tick",
    tickMs: TICK_MS,
    step: () => {
      const next = stepSnake(game.current);
      if (next === "over") return "over";
      game.current = next;
    },
    redraw: draw,
    hud: () => ({ score: game.current.score }),
  });

  function draw() {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { snake, food } = game.current;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);
    // food
    ctx.fillStyle = `rgb(${accentRef.current})`;
    ctx.fillRect(food.x * CELL + 2, food.y * CELL + 2, CELL - 4, CELL - 4);
    // snake
    snake.forEach((p, i) => {
      const alpha = i === 0 ? 1 : Math.max(0.18, 0.82 - i * 0.032);
      ctx.fillStyle = i === 0 ? "#fff" : `rgb(${accentRef.current} / ${alpha})`;
      ctx.fillRect(p.x * CELL + 1, p.y * CELL + 1, CELL - 2, CELL - 2);
    });
  }

  function play(m: Mode) {
    setMode(m);
    start(() => {
      game.current = newSnake(m);
    });
  }

  function onKey(e: React.KeyboardEvent) {
    const d = KEY_DIRS[e.key];
    if (d) { e.preventDefault(); game.current = turn(game.current, d); }
  }

  function onTouchStart(e: React.TouchEvent) {
    e.preventDefault();
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }

  function onTouchEnd(e: React.TouchEvent) {
    e.preventDefault();
    const t = touchStart.current;
    if (!t) return;
    touchStart.current = null;
    const dx = e.changedTouches[0].clientX - t.x;
    const dy = e.changedTouches[0].clientY - t.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 12) return;
    const d: Dir = Math.abs(dx) > Math.abs(dy)
      ? (dx > 0 ? "R" : "L")
      : (dy > 0 ? "D" : "U");
    game.current = turn(game.current, d);
  }

  const ModeBtn = ({ m, label }: { m: Mode; label: string }) => (
    <TerminalButton
      onClick={() => play(m)}
      selected={mode === m && phase !== "idle"}
    >
      {label}
    </TerminalButton>
  );

  return (
    <div className="flex flex-col items-center gap-3">
      <GameShell
        phase={phase}
        overlay={
          <GameOverlay
            phase={phase}
            title="SNAKE"
            score={hud.score}
            hint="arrow keys or wasd"
          >
            <div className="flex flex-col items-center gap-3">
              <p className="mono text-[9px] text-fg-3">
                {phase === "over" ? "play again:" : "choose border mode:"}
              </p>
              <div className="flex gap-2">
                <ModeBtn m="walls" label="WALLS" />
                <ModeBtn m="wrap" label="WRAP" />
              </div>
            </div>
          </GameOverlay>
        }
      >
        <canvas
          ref={canvasRef} width={W} height={H} tabIndex={0}
          onKeyDown={onKey} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
          className="block cursor-pointer border border-[rgba(255,255,255,0.06)] outline-none focus:border-accent/[0.25]"
          style={{ touchAction: "none" }}
        />
      </GameShell>
      <ScoreLine phase={phase} score={hud.score} />
    </div>
  );
}
