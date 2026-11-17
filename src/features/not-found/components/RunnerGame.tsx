import { useEffect, useRef } from "react";
import {
  FRAME_MS,
  GROUND_Y,
  H,
  jump,
  newRunner,
  PLAYER_H,
  PLAYER_W,
  PLAYER_X,
  releaseJump,
  runnerScore,
  stepRunner,
  W,
  type Obstacle,
} from "@/features/not-found/runner-logic";
import { useCanvasGame } from "@/features/playground/useCanvasGame";

const HI_KEY = "lost-packet-hi";
const FONT = "11px 'JetBrains Mono', ui-monospace, monospace";
const JUMP_KEYS = new Set([" ", "ArrowUp", "w", "W"]);
/** A jump still held as the run ends shouldn't instantly restart it. */
const RESTART_DELAY_MS = 400;

type Status = "idle" | "playing" | "over";

function readHi(): number {
  try {
    return Number(localStorage.getItem(HI_KEY)) || 0;
  } catch {
    return 0;
  }
}

function saveHi(hi: number): void {
  try {
    localStorage.setItem(HI_KEY, String(hi));
  } catch {
    // Private mode or blocked storage: the best score just won't persist.
  }
}

// Keys typed into the palette, links or buttons belong to them, not the game.
function ownsKeys(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT", "BUTTON", "A"].includes(target.tagName)
  );
}

// The 404 page's endless runner: a lost request hopping firewalls until it finds a route.
export function RunnerGame() {
  const game = useRef(newRunner());
  const status = useRef<Status>("idle");
  const hi = useRef(0);
  const clock = useRef<{ last: number | null; acc: number }>({ last: null, acc: 0 });
  const runFrame = useRef(0);
  const diedAt = useRef(-Infinity);

  const { canvasRef, accentRef, playing, start } = useCanvasGame({
    driver: "raf",
    step: (time) => {
      const c = clock.current;
      c.acc += Math.min(100, time - (c.last ?? time));
      c.last = time;
      while (c.acc >= FRAME_MS) {
        c.acc -= FRAME_MS;
        runFrame.current += 1;
        const next = stepRunner(game.current);
        if (next === "over") {
          status.current = "over";
          diedAt.current = time;
          const score = runnerScore(game.current);
          if (score > hi.current) {
            hi.current = score;
            saveHi(score);
          }
          return "over";
        }
        game.current = next;
      }
    },
    redraw: draw,
    // The score is painted on the canvas, so React needs no per-frame HUD.
    hud: () => ({}),
    onAccent: () => {
      hi.current = readHi();
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
    },
  });

  function draw() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = canvas.width / W;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const accent = accentRef.current;
    const { distance, lift, obstacles } = game.current;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);

    // Far-off nodes drift slower than the wire, for a little depth.
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    for (let i = 0; i < 14; i++) {
      const x = W - ((i * 173 + distance * 0.12) % (W + 20));
      ctx.fillRect(x, 18 + ((i * 47) % 70), 1.5, 1.5);
    }

    // The wire, with scrolling specks so speed reads even on an empty stretch.
    ctx.fillStyle = "rgba(255,255,255,0.28)";
    ctx.fillRect(0, GROUND_Y, W, 1);
    ctx.fillStyle = "rgba(255,255,255,0.14)";
    for (let i = 0; i < 24; i++) {
      const x = W - ((i * 97 + distance) % (W + 20));
      ctx.fillRect(x, GROUND_Y + 4 + ((i * 7) % 12), 2 + (i % 3) * 2, 1);
    }

    obstacles.forEach((o) => drawObstacle(ctx, o, accent));
    drawPlayer(ctx, lift, accent);

    ctx.font = FONT;
    ctx.textBaseline = "top";
    ctx.textAlign = "right";
    const pad = (n: number) => String(n).padStart(5, "0");
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fillText(`HI ${pad(hi.current)}`, W - 72, 12);
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fillText(pad(runnerScore(game.current)), W - 14, 12);

    if (status.current !== "playing") {
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const over = status.current === "over";
      ctx.fillStyle = over ? `rgb(${accent})` : "rgba(255,255,255,0.85)";
      ctx.font = `bold ${FONT}`;
      ctx.fillText(over ? "CONNECTION LOST" : "LOST PACKET", W / 2, 54);
      ctx.font = FONT;
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.fillText(over ? "space / tap to retry" : "space / tap to run", W / 2, 74);
    }
  }

  function drawPlayer(ctx: CanvasRenderingContext2D, lift: number, accent: string) {
    const top = GROUND_Y - lift - PLAYER_H;
    const bodyH = PLAYER_H - 4;
    ctx.fillStyle = `rgb(${accent})`;
    ctx.fillRect(PLAYER_X, top, PLAYER_W, bodyH);
    // Legs alternate while running, tuck in mid-air.
    const stride = lift === 0 && status.current === "playing" ? Math.floor(runFrame.current / 5) % 2 : -1;
    ctx.fillRect(PLAYER_X + 3, top + bodyH, 4, stride === 0 ? 4 : 2);
    ctx.fillRect(PLAYER_X + PLAYER_W - 7, top + bodyH, 4, stride === 1 ? 4 : 2);
    ctx.fillStyle = "#000";
    if (status.current === "over") {
      ctx.fillRect(PLAYER_X + 10, top + 4, 5, 1.5);
      ctx.fillRect(PLAYER_X + 11.75, top + 2.25, 1.5, 5);
    } else {
      ctx.fillRect(PLAYER_X + 11, top + 4, 3, 3);
    }
  }

  function drawObstacle(ctx: CanvasRenderingContext2D, o: Obstacle, accent: string) {
    const top = GROUND_Y - o.lift - o.h;
    if (o.lift > 0) {
      // A dropped packet: outlined frame with a motion trail.
      ctx.fillStyle = `rgb(${accent} / 0.2)`;
      ctx.fillRect(o.x + o.w, top + o.h / 2 - 0.5, 14, 1);
      ctx.strokeStyle = `rgb(${accent} / 0.9)`;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(o.x + 0.75, top + 0.75, o.w - 1.5, o.h - 1.5);
      ctx.fillStyle = `rgb(${accent} / 0.9)`;
      ctx.fillRect(o.x + 5, top + o.h / 2 - 1, o.w - 10, 2);
      return;
    }
    // A firewall: a rack of stacked units.
    ctx.fillStyle = "rgba(255,255,255,0.78)";
    ctx.fillRect(o.x, top, o.w, o.h);
    ctx.fillStyle = "#000";
    for (let y = top + 5; y < GROUND_Y - 2; y += 6) ctx.fillRect(o.x + 2, y, o.w - 4, 1);
    ctx.fillStyle = `rgb(${accent})`;
    ctx.fillRect(o.x + o.w - 5, top + 2, 2, 2);
  }

  function play() {
    clock.current = { last: null, acc: 0 };
    runFrame.current = 0;
    status.current = "playing";
    start(() => {
      game.current = newRunner();
    });
  }

  function press() {
    if (playing()) game.current = jump(game.current);
    else if (performance.now() - diedAt.current >= RESTART_DELAY_MS) play();
  }

  function release() {
    if (playing()) game.current = releaseJump(game.current);
  }

  // Like the browser's own offline page, the whole page listens, not just the canvas.
  useEffect(() => {
    function onDown(e: KeyboardEvent) {
      if (!JUMP_KEYS.has(e.key) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (ownsKeys(e.target)) return;
      e.preventDefault();
      if (!e.repeat) press();
    }
    function onUp(e: KeyboardEvent) {
      if (JUMP_KEYS.has(e.key)) release();
    }
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  });

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      tabIndex={0}
      role="img"
      aria-label="Lost Packet, a small runner game. Press space or tap to jump."
      onPointerDown={(e) => {
        e.preventDefault();
        press();
      }}
      onPointerUp={release}
      onPointerCancel={release}
      className="block h-auto w-full cursor-pointer select-none border border-[rgba(255,255,255,0.06)] outline-none focus-visible:border-accent/[0.35]"
      style={{ touchAction: "none", aspectRatio: `${W} / ${H}` }}
    />
  );
}
