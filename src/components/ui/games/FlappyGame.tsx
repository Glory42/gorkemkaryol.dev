import { useEffect, useRef, useState } from "react";

const W = 280, H = 420;
const BIRD_X = 65, BIRD_R = 10;
const PIPE_W = 44, GAP = 118;
const GRAVITY = 0.38, JUMP_VEL = -7.2;
const PIPE_SPEED = 2.2, PIPE_EVERY = 88;

type Phase = "idle" | "playing" | "over";
type Pipe = { x: number; topH: number; passed: boolean };

export function FlappyGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const game = useRef({
    y: H / 2, vy: 0,
    pipes: [] as Pipe[],
    frame: 0,
    alive: false,
    score: 0,
  });
  const rafRef = useRef<number>(0);
  const loopRef = useRef<FrameRequestCallback>(() => {});
  const [ui, setUi] = useState<{ score: number; phase: Phase }>({ score: 0, phase: "idle" });

  function draw() {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { y, pipes } = game.current;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);
    // pipes
    ctx.fillStyle = "rgba(168,85,247,0.45)";
    pipes.forEach(p => {
      ctx.fillRect(p.x, 0, PIPE_W, p.topH);
      ctx.fillRect(p.x, p.topH + GAP, PIPE_W, H - p.topH - GAP);
      // pipe caps
      ctx.fillStyle = "rgba(168,85,247,0.65)";
      ctx.fillRect(p.x - 3, p.topH - 10, PIPE_W + 6, 10);
      ctx.fillRect(p.x - 3, p.topH + GAP, PIPE_W + 6, 10);
      ctx.fillStyle = "rgba(168,85,247,0.45)";
    });
    // bird — tilts with velocity
    const tilt = Math.max(-0.45, Math.min(0.9, game.current.vy * 0.075));
    ctx.save();
    ctx.translate(BIRD_X, y);
    ctx.rotate(tilt);
    // wing
    ctx.fillStyle = "rgba(168,85,247,0.65)";
    ctx.beginPath();
    ctx.ellipse(-1, 5, 8, 4, -0.3, 0, Math.PI * 2);
    ctx.fill();
    // body
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(0, 0, 12, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    // beak
    ctx.fillStyle = "rgba(246,193,119,0.95)";
    ctx.beginPath();
    ctx.moveTo(11, -1);
    ctx.lineTo(17, 1);
    ctx.lineTo(11, 3);
    ctx.closePath();
    ctx.fill();
    // eye
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.arc(6, -3, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(7, -4, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function jump() {
    game.current.vy = JUMP_VEL;
  }

  loopRef.current = () => {
    const s = game.current;
    if (!s.alive) return;
    s.vy += GRAVITY;
    s.y += s.vy;
    s.frame++;
    // spawn pipes
    if (s.frame % PIPE_EVERY === 0) {
      const topH = 55 + Math.random() * (H - GAP - 110);
      s.pipes.push({ x: W + 10, topH, passed: false });
    }
    s.pipes.forEach(p => { p.x -= PIPE_SPEED; });
    s.pipes = s.pipes.filter(p => p.x + PIPE_W > -10);
    // score
    s.pipes.forEach(p => {
      if (!p.passed && p.x + PIPE_W < BIRD_X - BIRD_R) {
        p.passed = true;
        s.score++;
        setUi({ score: s.score, phase: "playing" });
      }
    });
    // collision: ceiling / floor / pipes
    const dead = s.y - BIRD_R <= 0 || s.y + BIRD_R >= H ||
      s.pipes.some(p =>
        BIRD_X + BIRD_R > p.x + 2 && BIRD_X - BIRD_R < p.x + PIPE_W - 2 &&
        (s.y - BIRD_R < p.topH || s.y + BIRD_R > p.topH + GAP)
      );
    if (dead) {
      s.alive = false;
      cancelAnimationFrame(rafRef.current!);
      setUi({ score: s.score, phase: "over" });
      draw();
      return;
    }
    draw();
    rafRef.current = requestAnimationFrame(t => loopRef.current(t));
  };

  function start() {
    const s = game.current;
    s.y = H / 2; s.vy = -3; s.pipes = []; s.frame = 0; s.alive = true; s.score = 0;
    setUi({ score: 0, phase: "playing" });
    cancelAnimationFrame(rafRef.current!);
    rafRef.current = requestAnimationFrame(t => loopRef.current(t));
    canvasRef.current?.focus();
  }

  useEffect(() => {
    draw();
    return () => cancelAnimationFrame(rafRef.current!);
  }, []);

  function onKey(e: React.KeyboardEvent) {
    if (e.key === " " || e.key === "ArrowUp") {
      e.preventDefault();
      if (game.current.alive) jump();
      else start();
    }
  }

  function onClick() {
    if (game.current.alive) jump();
    else start();
  }

  function onTouch(e: React.TouchEvent) {
    e.preventDefault();
    if (game.current.alive) jump(); else start();
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative select-none">
        <canvas
          ref={canvasRef} width={W} height={H} tabIndex={0}
          onKeyDown={onKey} onClick={onClick} onTouchStart={onTouch}
          className="block cursor-pointer border border-[rgba(255,255,255,0.06)] outline-none focus:border-[rgba(168,85,247,0.25)]"
          style={{ touchAction: "none" }}
        />
        {ui.phase !== "playing" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[rgba(0,0,0,0.85)]">
            <p className="mono text-[11px] font-bold tracking-[0.15em] text-white">
              {ui.phase === "over" ? "GAME OVER" : "FLAPPY BIRD"}
            </p>
            {ui.phase === "over" && (
              <p className="mono text-[9px] text-[rgba(168,85,247,0.65)]">score — {ui.score}</p>
            )}
            <button
              onClick={start}
              className="mono border border-[rgba(168,85,247,0.4)] px-5 py-2 text-[9px] tracking-[0.18em] text-[rgba(168,85,247,0.8)] transition-colors hover:border-[#a855f7] hover:text-[#a855f7]"
            >
              {ui.phase === "over" ? "RESTART" : "START"}
            </button>
            <p className="mono text-[8px] text-[#2a2a2a]">space or click to flap</p>
          </div>
        )}
      </div>
      {ui.phase !== "idle" && <p className="mono text-[9px] text-[rgba(168,85,247,0.45)]">score — {ui.score}</p>}
    </div>
  );
}
