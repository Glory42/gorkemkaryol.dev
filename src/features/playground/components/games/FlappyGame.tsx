import { useRef, useState } from "react";
import {
  GameOverlay,
  GameShell,
} from "@/features/playground/components/GameShell";
import { useCanvasGame } from "@/features/playground/useCanvasGame";

const W = 280, H = 420;
const BIRD_X = 65, BIRD_R = 10;
const PIPE_W = 44, GAP = 118;
const GRAVITY = 0.38, JUMP_VEL = -7.2;
const PIPE_SPEED = 2.2, PIPE_EVERY = 88;

type Pipe = { x: number; topH: number; passed: boolean };

export function FlappyGame() {
  const game = useRef({
    y: H / 2, vy: 0,
    pipes: [] as Pipe[],
    frame: 0,
    alive: false,
    score: 0,
  });
  const [score, setScore] = useState(0);

  const { canvasRef, accentRef, phase, beginPlay, endPlay } = useCanvasGame({
    driver: "raf",
    step,
    redraw: draw,
  });

  function draw() {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const accent = accentRef.current;
    const { y, pipes } = game.current;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);
    // pipes
    ctx.fillStyle = `rgb(${accent} / 0.45)`;
    pipes.forEach(p => {
      ctx.fillRect(p.x, 0, PIPE_W, p.topH);
      ctx.fillRect(p.x, p.topH + GAP, PIPE_W, H - p.topH - GAP);
      // pipe caps
      ctx.fillStyle = `rgb(${accent} / 0.65)`;
      ctx.fillRect(p.x - 3, p.topH - 10, PIPE_W + 6, 10);
      ctx.fillRect(p.x - 3, p.topH + GAP, PIPE_W + 6, 10);
      ctx.fillStyle = `rgb(${accent} / 0.45)`;
    });
    // bird — tilts with velocity
    const tilt = Math.max(-0.45, Math.min(0.9, game.current.vy * 0.075));
    ctx.save();
    ctx.translate(BIRD_X, y);
    ctx.rotate(tilt);
    // wing
    ctx.fillStyle = `rgb(${accent} / 0.65)`;
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

  function step() {
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
        setScore(s.score);
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
      endPlay();
      draw();
      return;
    }
    draw();
  }

  function start() {
    const s = game.current;
    s.y = H / 2; s.vy = -3; s.pipes = []; s.frame = 0; s.alive = true; s.score = 0;
    setScore(0);
    beginPlay();
    canvasRef.current?.focus();
  }

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
      <GameShell
        phase={phase}
        overlay={
          <GameOverlay
            phase={phase}
            title="FLAPPY BIRD"
            score={score}
            hint="space or click to flap"
            onStart={start}
          />
        }
      >
        <canvas
          ref={canvasRef} width={W} height={H} tabIndex={0}
          onKeyDown={onKey} onClick={onClick} onTouchStart={onTouch}
          className="block cursor-pointer border border-[rgba(255,255,255,0.06)] outline-none focus:border-accent/[0.25]"
          style={{ touchAction: "none" }}
        />
      </GameShell>
      {phase !== "idle" && <p className="mono text-[9px] text-accent/[0.45]">score — {score}</p>}
    </div>
  );
}
