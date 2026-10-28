import { describe, expect, it } from "vitest";
import {
  BIRD_R,
  BIRD_X,
  flap,
  H,
  newFlappy,
  PIPE_W,
  stepFlappy,
  type FlappyState,
} from "@/features/playground/flappy-logic";

const advance = (state: FlappyState): FlappyState => {
  const next = stepFlappy(state, () => 0.5);
  if (next === "over") throw new Error("unexpected death");
  return next;
};

describe("stepFlappy", () => {
  it("pulls the bird down under gravity", () => {
    const next = advance({ ...newFlappy(), vy: 0 });
    expect(next.vy).toBeGreaterThan(0);
    expect(next.y).toBeGreaterThan(H / 2);
  });

  it("flap sends the bird upward on the next frame", () => {
    const next = advance(flap(newFlappy()));
    expect(next.y).toBeLessThan(H / 2);
  });

  it("spawns a pipe every 88 frames", () => {
    expect(advance({ ...newFlappy(), frame: 86 }).pipes).toHaveLength(0);
    expect(advance({ ...newFlappy(), frame: 87 }).pipes).toHaveLength(1);
  });

  it("scores a pipe once the bird has cleared it", () => {
    const behind = { x: BIRD_X - BIRD_R - PIPE_W + 1, topH: 100, passed: false };
    const next = advance({ ...newFlappy(), y: 200, vy: 0, pipes: [behind] });
    expect(next.score).toBe(1);
    expect(advance(next).score).toBe(1);
  });

  it("dies on the floor and inside a pipe", () => {
    expect(stepFlappy({ ...newFlappy(), y: H - BIRD_R, vy: 0 })).toBe("over");
    const wall = { x: BIRD_X - 5, topH: 300, passed: false };
    expect(stepFlappy({ ...newFlappy(), y: 200, vy: 0, pipes: [wall] })).toBe("over");
  });
});
