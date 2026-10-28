import { describe, expect, it } from "vitest";
import {
  COLS,
  newSnake,
  randFood,
  stepSnake,
  turn,
  type SnakeState,
} from "@/features/playground/snake-logic";

// Food parked far from the action so a step never eats by accident.
const FAR = { x: 0, y: 0 };
const snakeAt = (over: Partial<SnakeState> = {}): SnakeState => ({
  ...newSnake("walls", () => 0.99),
  food: FAR,
  ...over,
});

describe("stepSnake", () => {
  it("moves the head one cell and drops the tail", () => {
    const next = stepSnake(snakeAt());
    if (next === "over") throw new Error("expected a move");
    expect(next.snake).toEqual([{ x: 13, y: 12 }, { x: 12, y: 12 }, { x: 11, y: 12 }]);
  });

  it("grows, scores and re-rolls food on a bite", () => {
    const next = stepSnake(snakeAt({ food: { x: 13, y: 12 } }), () => 0);
    if (next === "over") throw new Error("expected a bite");
    expect(next.snake).toHaveLength(4);
    expect(next.score).toBe(1);
    expect(next.food).toEqual({ x: 0, y: 0 });
  });

  it("dies on a wall in walls mode and wraps in wrap mode", () => {
    const edge = [{ x: COLS - 1, y: 5 }, { x: COLS - 2, y: 5 }];
    expect(stepSnake(snakeAt({ snake: edge }))).toBe("over");

    const wrapped = stepSnake(snakeAt({ snake: edge, mode: "wrap" }));
    if (wrapped === "over") throw new Error("expected a wrap");
    expect(wrapped.snake[0]).toEqual({ x: 0, y: 5 });
  });

  it("dies running into its own body", () => {
    const coiled = [
      { x: 5, y: 5 }, { x: 5, y: 6 }, { x: 6, y: 6 }, { x: 6, y: 5 }, { x: 6, y: 4 },
    ];
    expect(stepSnake(snakeAt({ snake: coiled, dir: "U", next: "R" }))).toBe("over");
  });
});

describe("turn", () => {
  it("queues a perpendicular turn and ignores a reversal", () => {
    const s = snakeAt();
    expect(turn(s, "U").next).toBe("U");
    expect(turn(s, "L")).toBe(s);
  });
});

describe("randFood", () => {
  it("never lands on the snake", () => {
    const rolls = [0, 0, 0.5, 0.5];
    const food = randFood([{ x: 0, y: 0 }], () => rolls.shift()!);
    expect(food).toEqual({ x: 12, y: 12 });
  });
});
