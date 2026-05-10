import { useEffect, useRef, useState } from "react";

const BW = 10, BH = 20, CELL = 22;
const W = BW * CELL, H = BH * CELL;
const NCELL = 18, NW = 4 * NCELL, NH = 4 * NCELL;

type Board = (string | null)[][];
type Shape = number[][];
type Phase = "idle" | "playing" | "over";

const PIECES: { shape: Shape; color: string }[] = [
  { shape: [[1, 1, 1, 1]], color: "#c084fc" },
  { shape: [[1, 1], [1, 1]], color: "#a855f7" },
  { shape: [[0, 1, 0], [1, 1, 1]], color: "#9333ea" },
  { shape: [[0, 1, 1], [1, 1, 0]], color: "#7c3aed" },
  { shape: [[1, 1, 0], [0, 1, 1]], color: "#6d28d9" },
  { shape: [[1, 0, 0], [1, 1, 1]], color: "#8b5cf6" },
  { shape: [[0, 0, 1], [1, 1, 1]], color: "#d8b4fe" },
];

function mkBoard(): Board {
  return Array.from({ length: BH }, () => Array<string | null>(BW).fill(null));
}
function rotate(s: Shape): Shape {
  return s[0].map((_, i) => s.map(r => r[i]).reverse());
}
function fits(board: Board, shape: Shape, px: number, py: number): boolean {
  for (let y = 0; y < shape.length; y++)
    for (let x = 0; x < shape[y].length; x++) {
      if (!shape[y][x]) continue;
      const nx = px + x, ny = py + y;
      if (nx < 0 || nx >= BW || ny >= BH) return false;
      if (ny >= 0 && board[ny][nx]) return false;
    }
  return true;
}
function randPiece() { return { ...PIECES[Math.floor(Math.random() * PIECES.length)] }; }

export function TetrisGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nextRef = useRef<HTMLCanvasElement>(null);
  const game = useRef({
    board: mkBoard(),
    cur: null as ({ shape: Shape; color: string; x: number; y: number }) | null,
    next: randPiece(),
    score: 0, level: 1, lines: 0,
    alive: false, lastTick: 0,
  });
  const rafRef = useRef<number>(0);
  const loopRef = useRef<FrameRequestCallback>(() => {});
  const [ui, setUi] = useState<{ score: number; level: number; lines: number; phase: Phase }>({
    score: 0, level: 1, lines: 0, phase: "idle",
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
          ctx.fillStyle = "rgba(168,85,247,0.12)";
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
      cancelAnimationFrame(rafRef.current);
      setUi(u => ({ ...u, phase: "over" }));
    }
  }

  function lockPiece() {
    const s = game.current;
    const p = s.cur; if (!p) return;
    p.shape.forEach((row, dy) => row.forEach((v, dx) => {
      if (v && p.y + dy >= 0) s.board[p.y + dy][p.x + dx] = p.color;
    }));
    let cleared = 0;
    for (let y = BH - 1; y >= 0; y--) {
      if (s.board[y].every(c => c !== null)) {
        s.board.splice(y, 1);
        s.board.unshift(Array<string | null>(BW).fill(null));
        cleared++; y++;
      }
    }
    if (cleared > 0) {
      s.score += [0, 100, 300, 500, 800][Math.min(cleared, 4)] * s.level;
      s.lines += cleared;
      s.level = Math.floor(s.lines / 10) + 1;
      setUi({ score: s.score, level: s.level, lines: s.lines, phase: "playing" });
    }
    spawnPiece();
  }

  loopRef.current = (t: number) => {
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
    rafRef.current = requestAnimationFrame(t2 => loopRef.current(t2));
  };

  function start() {
    const s = game.current;
    s.board = mkBoard(); s.cur = null; s.next = randPiece();
    s.score = 0; s.level = 1; s.lines = 0; s.alive = true; s.lastTick = 0;
    setUi({ score: 0, level: 1, lines: 0, phase: "playing" });
    cancelAnimationFrame(rafRef.current);
    spawnPiece();
    rafRef.current = requestAnimationFrame(t => loopRef.current(t));
    draw();
    canvasRef.current?.focus();
  }

  useEffect(() => {
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

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
      <div className="relative select-none">
        <canvas
          ref={canvasRef} width={W} height={H} tabIndex={0} onKeyDown={onKey}
          className="block cursor-pointer outline-none"
        />
        {ui.phase !== "playing" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[rgba(0,0,0,0.85)]">
            <p className="mono text-[11px] font-bold tracking-[0.15em] text-white">
              {ui.phase === "over" ? "GAME OVER" : "TETRIS"}
            </p>
            {ui.phase === "over" && (
              <>
                <p className="mono text-[9px] text-[rgba(168,85,247,0.65)]">score — {ui.score}</p>
                <p className="mono text-[8px] text-[#333]">level {ui.level} · {ui.lines} lines</p>
              </>
            )}
            <button onClick={start} className="mono border border-[rgba(168,85,247,0.4)] px-5 py-2 text-[9px] tracking-[0.18em] text-[rgba(168,85,247,0.8)] transition-colors hover:border-[#a855f7] hover:text-[#a855f7]">
              {ui.phase === "over" ? "RESTART" : "START"}
            </button>
            <p className="mono text-center text-[8px] leading-[1.8] text-[#2a2a2a]">
              ← → move · ↑ rotate · ↓ drop<br />space hard drop
            </p>
          </div>
        )}
      </div>

      {/* Touch controls — shown while playing */}
      {ui.phase === "playing" && (
        <div className="mt-2 grid grid-cols-4 gap-1.5">
          {([ ["←", moveLeft], ["↺", rotatePiece], ["→", moveRight], ["↓↓", hardDrop] ] as [string, () => void][]).map(([label, action]) => (
            <button
              key={label}
              {...tb(action)}
              className="mono select-none border border-[rgba(168,85,247,0.25)] py-3 text-[13px] text-[rgba(168,85,247,0.6)] active:border-[#a855f7] active:text-[#a855f7]"
            >
              {label}
            </button>
          ))}
        </div>
      )}
      </div>

      {/* Side panel — only shown while playing */}
      {ui.phase === "playing" && <div className="flex flex-col gap-5 pt-1">
        <div>
          <p className="mono mb-2 text-[8px] tracking-[0.18em] text-[rgba(168,85,247,0.4)]">NEXT</p>
          <canvas
            ref={nextRef} width={NW} height={NH}
            className="border border-[rgba(255,255,255,0.05)]"
          />
        </div>
        <div className="flex flex-col gap-3">
          {([["SCORE", ui.score], ["LEVEL", ui.level], ["LINES", ui.lines]] as [string, number][]).map(([label, val]) => (
            <div key={label}>
              <p className="mono text-[7px] tracking-[0.18em] text-[#2a2a2a]">{label}</p>
              <p className="mono text-[12px] text-[rgba(168,85,247,0.65)]">{val}</p>
            </div>
          ))}
        </div>
      </div>}
    </div>
  );
}
