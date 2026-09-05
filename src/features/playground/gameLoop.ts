export type LoopDriver = "raf" | "tick";

export interface GameLoop {
  start(): void;
  stop(): void;
  readonly running: boolean;
}

function nowMs(): number {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

// A frame pump with two drivers: "raf" (requestAnimationFrame, smooth per-frame
// games) and "tick" (setInterval at tickMs, fixed-step games). start() cancels
// any prior run; stop() is idempotent; a queued frame that lands after stop()
// is a no-op.
export function createGameLoop(opts: {
  driver: LoopDriver;
  tickMs?: number;
  step: (time: number) => void;
}): GameLoop {
  let running = false;
  let rafId = 0;
  let timerId: ReturnType<typeof setInterval> | undefined;

  function stop(): void {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
    if (timerId !== undefined) clearInterval(timerId);
    timerId = undefined;
  }

  function start(): void {
    stop();
    running = true;
    if (opts.driver === "raf") {
      const frame = (t: number): void => {
        if (!running) return;
        opts.step(t);
        rafId = requestAnimationFrame(frame);
      };
      rafId = requestAnimationFrame(frame);
    } else {
      timerId = setInterval(() => {
        if (running) opts.step(nowMs());
      }, opts.tickMs ?? 100);
    }
  }

  return {
    start,
    stop,
    get running() {
      return running;
    },
  };
}
