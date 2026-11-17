import { describe, expect, it } from "vitest";
import {
  hits,
  jump,
  newRunner,
  PLAYER_H,
  PLAYER_X,
  releaseJump,
  runnerScore,
  stepRunner,
  type RunnerState,
} from "@/features/not-found/runner-logic";

const advance = (state: RunnerState, rand = () => 0.5): RunnerState => {
  const next = stepRunner(state, rand);
  if (next === "over") throw new Error("unexpected death");
  return next;
};

const run = (state: RunnerState, frames: number): RunnerState => {
  let s = state;
  for (let i = 0; i < frames; i++) s = advance({ ...s, obstacles: [] });
  return s;
};

describe("jumping", () => {
  it("leaves the ground and lands again under gravity", () => {
    const up = advance(jump(newRunner()));
    expect(up.lift).toBeGreaterThan(0);
    const landed = run(up, 60);
    expect(landed.lift).toBe(0);
    expect(landed.vy).toBe(0);
  });

  it("doesn't double-jump, but queues a press made just before landing", () => {
    const air = run(jump(newRunner()), 10);
    const pressed = jump(air);
    expect(pressed.vy).toBe(air.vy);
    expect(pressed.buffer).toBeGreaterThan(0);
  });

  it("jumps on landing when a press was queued", () => {
    let s = run(jump(newRunner()), 28);
    expect(s.lift).toBeGreaterThan(0);
    // Without the queued press it would be back on the ground 12 frames later.
    s = run(jump(s), 12);
    expect(s.lift).toBeGreaterThan(0);
  });

  it("releasing early makes a shorter hop", () => {
    const peak = (release: boolean) => {
      let s = advance(jump(newRunner()));
      if (release) s = releaseJump(s);
      let top = 0;
      for (let i = 0; i < 40; i++) {
        s = run(s, 1);
        top = Math.max(top, s.lift);
      }
      return top;
    };
    expect(peak(true)).toBeLessThan(peak(false) / 2);
  });
});

describe("stepRunner", () => {
  it("spawns an obstacle once the gap runs out", () => {
    const next = advance({ ...newRunner(), gap: 1 });
    expect(next.obstacles).toHaveLength(1);
    expect(next.gap).toBeGreaterThan(0);
  });

  it("speeds up with distance and caps out", () => {
    expect(advance({ ...newRunner(), distance: 5000 }).speed).toBeGreaterThan(newRunner().speed);
    expect(advance({ ...newRunner(), distance: 1e9 }).speed).toBe(12);
  });

  it("dies running into a firewall", () => {
    const wall = { x: PLAYER_X + 4, w: 14, h: 30, lift: 0 };
    expect(stepRunner({ ...newRunner(), obstacles: [wall] })).toBe("over");
  });

  it("scores one point per ten pixels", () => {
    expect(runnerScore({ ...newRunner(), distance: 123 })).toBe(12);
  });
});

describe("hits", () => {
  it("lets a standing player pass under a high packet", () => {
    const high = { x: PLAYER_X, w: 22, h: 12, lift: PLAYER_H + 6 };
    expect(hits(0, high)).toBe(false);
    expect(hits(20, high)).toBe(true);
  });

  it("clears a firewall when high enough", () => {
    const wall = { x: PLAYER_X, w: 14, h: 30, lift: 0 };
    expect(hits(0, wall)).toBe(true);
    expect(hits(31, wall)).toBe(false);
  });
});
