import { useRef, useState, useEffect } from "react";

const COLS = 24, ROWS = 24, CELL = 15;
const W = COLS * CELL, H = ROWS * CELL;
const TICK_MS = 110;

type Dir = "U" | "D" | "L" | "R";
type Mode = "walls" | "wrap";
type Phase = "idle" | "playing" | "over";
type Pt = { x: number; y: number };

const OPP: Record<Dir, Dir> = { U: "D", D: "U", L: "R", R: "L" };

function randFood(snake: Pt[]): Pt {
  let p: Pt;
  do { p = { x: (Math.random() * COLS) | 0, y: (Math.random() * ROWS) | 0 }; }
  while (snake.some(s => s.x === p.x && s.y === p.y));
  return p;
}

export function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const game = useRef({
    snake: [] as Pt[], dir: "R" as Dir, next: "R" as Dir,
    food: { x: 18, y: 12 } as Pt, alive: false, score: 0, mode: "walls" as Mode,
  });
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const tickRef = useRef<() => void>(() => {});
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const [ui, setUi] = useState<{ score: number; phase: Phase; mode: Mode }>({ score: 0, phase: "idle", mode: "walls" });

  function draw() {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { snake, food } = game.current;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);
    // food
    ctx.fillStyle = "#a855f7";
    ctx.fillRect(food.x * CELL + 2, food.y * CELL + 2, CELL - 4, CELL - 4);
    // snake
    snake.forEach((p, i) => {
      const alpha = i === 0 ? 1 : Math.max(0.18, 0.82 - i * 0.032);
      ctx.fillStyle = i === 0 ? "#fff" : `rgba(168,85,247,${alpha})`;
      ctx.fillRect(p.x * CELL + 1, p.y * CELL + 1, CELL - 2, CELL - 2);
    });
  }

  tickRef.current = () => {
    const s = game.current;
    if (!s.alive) return;
    s.dir = s.next;
    let hx = s.snake[0].x, hy = s.snake[0].y;
    if (s.dir === "U") hy--;
    else if (s.dir === "D") hy++;
    else if (s.dir === "L") hx--;
    else hx++;

    if (s.mode === "wrap") {
      hx = (hx + COLS) % COLS;
      hy = (hy + ROWS) % ROWS;
    } else if (hx < 0 || hx >= COLS || hy < 0 || hy >= ROWS) {
      s.alive = false;
      clearInterval(timerRef.current);
      setUi(u => ({ ...u, phase: "over" }));
      draw();
      return;
    }

    if (s.snake.some(p => p.x === hx && p.y === hy)) {
      s.alive = false;
      clearInterval(timerRef.current);
      setUi(u => ({ ...u, phase: "over" }));
      draw();
      return;
    }

    s.snake.unshift({ x: hx, y: hy });
    if (hx === s.food.x && hy === s.food.y) {
      s.score++;
      s.food = randFood(s.snake);
      setUi(u => ({ ...u, score: s.score }));
    } else {
      s.snake.pop();
    }
    draw();
  };

  function start(mode: Mode) {
    const s = game.current;
    s.snake = [{ x: 12, y: 12 }, { x: 11, y: 12 }, { x: 10, y: 12 }];
    s.dir = s.next = "R";
    s.food = randFood(s.snake);
    s.alive = true;
    s.score = 0;
    s.mode = mode;
    setUi({ score: 0, phase: "playing", mode });
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => tickRef.current(), TICK_MS);
    draw();
    canvasRef.current?.focus();
  }

  useEffect(() => {
    draw();
    return () => clearInterval(timerRef.current);
  }, []);

  function onKey(e: React.KeyboardEvent) {
    const map: Record<string, Dir> = { ArrowUp: "U", ArrowDown: "D", ArrowLeft: "L", ArrowRight: "R", w: "U", s: "D", a: "L", d: "R" };
    const d = map[e.key];
    if (d) { e.preventDefault(); if (OPP[d] !== game.current.dir) game.current.next = d; }
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
    if (OPP[d] !== game.current.dir) game.current.next = d;
  }

  const ModeBtn = ({ m, label }: { m: Mode; label: string }) => (
    <button
      onClick={() => start(m)}
      className={`mono border px-4 py-2 text-[9px] tracking-[0.15em] transition-colors hover:border-[#a855f7] hover:text-[#a855f7] ${
        ui.mode === m && ui.phase !== "idle"
          ? "border-[rgba(168,85,247,0.5)] text-[#a855f7]"
          : "border-[rgba(168,85,247,0.35)] text-[rgba(168,85,247,0.75)]"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative select-none">
        <canvas
          ref={canvasRef} width={W} height={H} tabIndex={0}
          onKeyDown={onKey} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
          className="block cursor-pointer border border-[rgba(255,255,255,0.06)] outline-none focus:border-[rgba(168,85,247,0.25)]"
          style={{ touchAction: "none" }}
        />
        {ui.phase !== "playing" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[rgba(0,0,0,0.85)]">
            <p className="mono text-[11px] font-bold tracking-[0.15em] text-white">
              {ui.phase === "over" ? "GAME OVER" : "SNAKE"}
            </p>
            {ui.phase === "over" && (
              <p className="mono text-[9px] text-[rgba(168,85,247,0.65)]">score — {ui.score}</p>
            )}
            <div className="flex flex-col items-center gap-3">
              <p className="mono text-[8px] text-[#444]">
                {ui.phase === "over" ? "play again:" : "choose border mode:"}
              </p>
              <div className="flex gap-2">
                <ModeBtn m="walls" label="WALLS" />
                <ModeBtn m="wrap" label="WRAP" />
              </div>
            </div>
            <p className="mono text-[8px] text-[#2a2a2a]">arrow keys or wasd</p>
          </div>
        )}
      </div>
      {ui.phase !== "idle" && <p className="mono text-[9px] text-[rgba(168,85,247,0.45)]">score — {ui.score}</p>}
    </div>
  );
}
