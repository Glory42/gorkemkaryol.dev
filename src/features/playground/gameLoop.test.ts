import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createGameLoop } from "@/features/playground/gameLoop";

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

// Only the "tick" driver is exercised — requestAnimationFrame is not a node
// global. The "raf" branch is the same shape with rAF in place of setInterval.
describe("createGameLoop — tick driver", () => {
  it("calls step once per tickMs while running", () => {
    const step = vi.fn();
    const loop = createGameLoop({ driver: "tick", tickMs: 100, step });

    loop.start();
    vi.advanceTimersByTime(350);

    expect(step).toHaveBeenCalledTimes(3);
    expect(loop.running).toBe(true);
  });

  it("stops calling step after stop()", () => {
    const step = vi.fn();
    const loop = createGameLoop({ driver: "tick", tickMs: 100, step });

    loop.start();
    vi.advanceTimersByTime(120);
    loop.stop();
    vi.advanceTimersByTime(500);

    expect(step).toHaveBeenCalledTimes(1);
    expect(loop.running).toBe(false);
  });

  it("does not double up when start() is called again", () => {
    const step = vi.fn();
    const loop = createGameLoop({ driver: "tick", tickMs: 100, step });

    loop.start();
    vi.advanceTimersByTime(100);
    loop.start();
    vi.advanceTimersByTime(100);

    expect(step).toHaveBeenCalledTimes(2);
  });

  it("tolerates stop() called twice", () => {
    const loop = createGameLoop({ driver: "tick", tickMs: 50, step: vi.fn() });

    loop.start();
    loop.stop();

    expect(() => loop.stop()).not.toThrow();
    expect(loop.running).toBe(false);
  });
});
