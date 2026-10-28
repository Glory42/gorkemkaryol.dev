import { useRef } from "react";
import {
  GameOverlay,
  GameShell,
  ScoreLine,
} from "@/features/playground/components/GameShell";
import {
  BIRD_X,
  flap,
  GAP,
  H,
  newFlappy,
  PIPE_W,
  stepFlappy,
  W,
} from "@/features/playground/flappy-logic";
import { useCanvasGame } from "@/features/playground/useCanvasGame";

export function FlappyGame() {
  const game = useRef(newFlappy());

  const { canvasRef, accentRef, phase, hud, playing, start } = useCanvasGame({
    driver: "raf",
    step: () => {
      const next = stepFlappy(game.current);
      if (next === "over") return "over";
      game.current = next;
    },
    redraw: draw,
    hud: () => ({ score: game.current.score }),
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

  function play() {
    start(() => {
      game.current = newFlappy();
    });
  }

  // Space, click and tap all flap mid-run and (re)start otherwise.
  function act() {
    if (playing()) game.current = flap(game.current);
    else play();
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === " " || e.key === "ArrowUp") {
      e.preventDefault();
      act();
    }
  }

  function onTouch(e: React.TouchEvent) {
    e.preventDefault();
    act();
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <GameShell
        phase={phase}
        overlay={
          <GameOverlay
            phase={phase}
            title="FLAPPY BIRD"
            score={hud.score}
            hint="space or click to flap"
            onStart={play}
          />
        }
      >
        <canvas
          ref={canvasRef} width={W} height={H} tabIndex={0}
          onKeyDown={onKey} onClick={act} onTouchStart={onTouch}
          className="block cursor-pointer border border-[rgba(255,255,255,0.06)] outline-none focus:border-accent/[0.25]"
          style={{ touchAction: "none" }}
        />
      </GameShell>
      <ScoreLine phase={phase} score={hud.score} />
    </div>
  );
}
