import { useRef, useState } from "react";
import { ACCENT_RGB, accentMix } from "@/lib/accent";
import {
  GameOverlay,
  GameShell,
} from "@/features/playground/components/GameShell";
import {
  BOARD_H as BH,
  BOARD_W as BW,
  clearLines,
  fits,
  mkBoard,
  rotate,
  type Board,
  type Shape,
} from "@/features/playground/tetris-logic";
import { useCanvasGame } from "@/features/playground/useCanvasGame";

const CELL = 22;
const W = BW * CELL, H = BH * CELL;
const NCELL = 18, NW = 4 * NCELL, NH = 4 * NCELL;

// Each piece has a fixed shape and a `tint` (push the section accent toward
// white/black) so the seven stay distinct in whatever colour the section is.
const PIECE_DEFS: { shape: Shape; tint: number }[] = [
  { shape: [[1, 1, 1, 1]], tint: 0.35 },
  { shape: [[1, 1], [1, 1]], tint: 0 },
  { shape: [[0, 1, 0], [1, 1, 1]], tint: -0.15 },
  { shape: [[0, 1, 1], [1, 1, 0]], tint: -0.28 },
  { shape: [[1, 1, 0], [0, 1, 1]], tint: -0.4 },
  { shape: [[1, 0, 0], [1, 1, 1]], tint: -0.08 },
  { shape: [[0, 0, 1], [1, 1, 1]], tint: 0.6 },
];

// Resolved from the section accent on mount; seeded with the fallback so a piece
// rolled on the first render still has a colour.
let PIECE_PALETTE = PIECE_DEFS.map((d) => accentMix(ACCENT_RGB.playground, d.tint));

function randPiece() {
  const i = Math.floor(Math.random() * PIECE_DEFS.length);
  return { shape: PIECE_DEFS[i].shape, color: PIECE_PALETTE[i] };
}

export function TetrisGame() {
  const nextRef = useRef<HTMLCanvasElement>(null);
  const game = useRef({
    board: mkBoard(),
    cur: null as ({ shape: Shape; color: string; x: number; y: number }) | null,
    next: randPiece(),
    score: 0, level: 1, lines: 0,
    alive: false, lastTick: 0,
  });
  const [stats, setStats] = useState({ score: 0, level: 1, lines: 0 });

  const { canvasRef, accentRef, phase, beginPlay, endPlay } = useCanvasGame({
    driver: "raf",
    step,
    redraw: draw,
    onAccent: (rgb) => {
      PIECE_PALETTE = PIECE_DEFS.map((d) => accentMix(rgb, d.tint));
      game.current.next = randPiece();
    },
  });

  function drawNext() {
    const ctx = nextRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, NW, NH);
    const p = game.current.next;
    const ox = Math.floor((4 - p.shape[0].length) / 2);
    const oy = Math.floor((4 - p.shape.length) / 2);
    p.shape.forEach((row, y) => row.forEach((v, x) => {
      if (!v) return;
      ctx.fillStyle = p.color;
      ctx.fillRect((ox + x) * NCELL + 1, (oy + y) * NCELL + 1, NCELL - 2, NCELL - 2);
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.fillRect((ox + x) * NCELL + 1, (oy + y) * NCELL + 1, NCELL - 2, 3);
    }));
  }

  function draw() {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { board, cur } = game.current;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(255,255,255,0.025)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= BW; x++) { ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, H); ctx.stroke(); }
    for (let y = 0; y <= BH; y++) { ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(W, y * CELL); ctx.stroke(); }
    board.forEach((row, y) => row.forEach((c, x) => {
      if (!c) return;
      ctx.fillStyle = c;
      ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2);
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, 3);
    }));
    if (cur) {
      let ghostY = cur.y;
      while (fits(board, cur.shape, cur.x, ghostY + 1)) ghostY++;
      cur.shape.forEach((row, dy) => row.forEach((v, dx) => {
        if (!v) return;
        if (ghostY !== cur.y) {
          ctx.fillStyle = `rgb(${accentRef.current} / 0.12)`;
          ctx.fillRect((cur.x + dx) * CELL + 1, (ghostY + dy) * CELL + 1, CELL - 2, CELL - 2);
        }
        ctx.fillStyle = cur.color;
        ctx.fillRect((cur.x + dx) * CELL + 1, (cur.y + dy) * CELL + 1, CELL - 2, CELL - 2);
        ctx.fillStyle = "rgba(255,255,255,0.15)";
        ctx.fillRect((cur.x + dx) * CELL + 1, (cur.y + dy) * CELL + 1, CELL - 2, 3);
      }));
    }
    drawNext();
  }

  function spawnPiece() {
    const s = game.current;
    const p = s.next;
    s.next = randPiece();
    const x = Math.floor((BW - p.shape[0].length) / 2);
    s.cur = { ...p, x, y: 0 };
    if (!fits(s.board, p.shape, x, 0)) {
      s.alive = false;
      endPlay();
    }
  }

  function lockPiece() {
    const s = game.current;
    const p = s.cur; if (!p) return;
    p.shape.forEach((row, dy) => row.forEach((v, dx) => {
      if (v && p.y + dy >= 0) s.board[p.y + dy][p.x + dx] = p.color;
    }));
    const cleared = clearLines(s.board);
    s.board = cleared.board;
    if (cleared.cleared > 0) {
      s.score += [0, 100, 300, 500, 800][Math.min(cleared.cleared, 4)] * s.level;
      s.lines += cleared.cleared;
      s.level = Math.floor(s.lines / 10) + 1;
      setStats({ score: s.score, level: s.level, lines: s.lines });
    }
    spawnPiece();
  }

  function step(t: number) {
    const s = game.current;
    if (!s.alive) return;
    const speed = Math.max(80, 550 - (s.level - 1) * 50);
    if (t - s.lastTick >= speed) {
      s.lastTick = t;
      if (s.cur && fits(s.board, s.cur.shape, s.cur.x, s.cur.y + 1)) {
        s.cur.y++;
      } else {
        lockPiece();
        if (!s.alive) { draw(); return; }
      }
      draw();
    }
  }

  function start() {
    const s = game.current;
    s.board = mkBoard(); s.cur = null; s.next = randPiece();
    s.score = 0; s.level = 1; s.lines = 0; s.alive = true; s.lastTick = 0;
    setStats({ score: 0, level: 1, lines: 0 });
    spawnPiece();
    beginPlay();
    draw();
    canvasRef.current?.focus();
  }

  function moveLeft() {
    const s = game.current; const p = s.cur;
    if (!s.alive || !p) return;
    if (fits(s.board, p.shape, p.x - 1, p.y)) p.x--;
    draw();
  }
  function moveRight() {
    const s = game.current; const p = s.cur;
    if (!s.alive || !p) return;
    if (fits(s.board, p.shape, p.x + 1, p.y)) p.x++;
    draw();
  }
  function rotatePiece() {
    const s = game.current; const p = s.cur;
    if (!s.alive || !p) return;
    const rot = rotate(p.shape);
    if (fits(s.board, rot, p.x, p.y)) p.shape = rot;
    else if (fits(s.board, rot, p.x + 1, p.y)) { p.x++; p.shape = rot; }
    else if (fits(s.board, rot, p.x - 1, p.y)) { p.x--; p.shape = rot; }
    draw();
  }
  function hardDrop() {
    const s = game.current; const p = s.cur;
    if (!s.alive || !p) return;
    while (fits(s.board, p.shape, p.x, p.y + 1)) p.y++;
    lockPiece();
    draw();
  }

  function onKey(e: React.KeyboardEvent) {
    const s = game.current;
    if (!s.alive) { if (e.key === " " || e.key === "Enter") start(); return; }
    if (["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", " "].includes(e.key)) e.preventDefault();
    if (e.key === "ArrowLeft") moveLeft();
    else if (e.key === "ArrowRight") moveRight();
    else if (e.key === "ArrowDown") {
      const p = s.cur; if (!p) return;
      if (fits(s.board, p.shape, p.x, p.y + 1)) { p.y++; draw(); } else lockPiece();
    }
    else if (e.key === "ArrowUp" || e.key === "x" || e.key === "X") rotatePiece();
    else if (e.key === " ") hardDrop();
  }

  function tb(action: () => void) {
    return {
      onTouchStart: (e: React.TouchEvent) => { e.preventDefault(); action(); },
      onMouseDown: action,
    };
  }

  return (
    <div className="flex items-start gap-4">
      <div className="flex flex-col" style={{ width: W }}>
        <GameShell
          phase={phase}
          overlay={
            <GameOverlay
              phase={phase}
              title="TETRIS"
              score={stats.score}
              hint={<>← → move · ↑ rotate · ↓ drop<br />space hard drop</>}
              onStart={start}
            >
              {phase === "over" && (
                <p className="mono text-[8px] text-[#333]">
                  level {stats.level} · {stats.lines} lines
                </p>
              )}
            </GameOverlay>
          }
        >
          <canvas
            ref={canvasRef} width={W} height={H} tabIndex={0} onKeyDown={onKey}
            className="block cursor-pointer outline-none"
          />
        </GameShell>

        {/* Touch controls — shown while playing */}
        {phase === "playing" && (
          <div className="mt-2 grid grid-cols-4 gap-1.5">
            {([ ["←", moveLeft], ["↺", rotatePiece], ["→", moveRight], ["↓↓", hardDrop] ] as [string, () => void][]).map(([label, action]) => (
              <button
                key={label}
                {...tb(action)}
                className="mono select-none border border-accent/[0.25] py-3 text-[13px] text-accent/[0.6] active:border-accent active:text-accent"
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Side panel — only shown while playing */}
      {phase === "playing" && <div className="flex flex-col gap-5 pt-1">
        <div>
          <p className="mono mb-2 text-[8px] tracking-[0.18em] text-accent/[0.4]">NEXT</p>
          <canvas
            ref={nextRef} width={NW} height={NH}
            className="border border-[rgba(255,255,255,0.05)]"
          />
        </div>
        <div className="flex flex-col gap-3">
          {([["SCORE", stats.score], ["LEVEL", stats.level], ["LINES", stats.lines]] as [string, number][]).map(([label, val]) => (
            <div key={label}>
              <p className="mono text-[7px] tracking-[0.18em] text-[#2a2a2a]">{label}</p>
              <p className="mono text-[12px] text-accent/[0.65]">{val}</p>
            </div>
          ))}
        </div>
      </div>}
    </div>
  );
}
