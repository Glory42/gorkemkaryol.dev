import { describe, expect, it } from "vitest";
import {
  BOARD_W,
  clearLines,
  fits,
  mkBoard,
  rotate,
} from "@/features/playground/tetris-logic";

describe("rotate", () => {
  it("turns the T piece a quarter clockwise", () => {
    expect(rotate([[0, 1, 0], [1, 1, 1]])).toEqual([
      [1, 0],
      [1, 1],
      [1, 0],
    ]);
  });
});

describe("fits", () => {
  it("accepts a piece inside the well", () => {
    expect(fits(mkBoard(), [[1, 1]], 0, 0)).toBe(true);
  });

  it("rejects a piece past the left wall", () => {
    expect(fits(mkBoard(), [[1, 1]], -1, 0)).toBe(false);
  });

  it("rejects a piece past the floor", () => {
    expect(fits(mkBoard(), [[1]], 0, 20)).toBe(false);
  });

  it("rejects a piece overlapping a locked cell", () => {
    const board = mkBoard();
    board[0][3] = "#fff";
    expect(fits(board, [[1]], 3, 0)).toBe(false);
  });
});

describe("clearLines", () => {
  it("removes a full row and pushes an empty row on top", () => {
    const board = mkBoard();
    board[19] = Array<string | null>(BOARD_W).fill("#0f0");

    const result = clearLines(board);

    expect(result.cleared).toBe(1);
    expect(result.board).toHaveLength(20);
    expect(result.board[0].every((c) => c === null)).toBe(true);
    expect(result.board[19].every((c) => c === null)).toBe(true);
  });

  it("leaves a board with no full rows untouched", () => {
    const board = mkBoard();
    board[19][0] = "#0f0";

    const result = clearLines(board);

    expect(result.cleared).toBe(0);
    expect(result.board[19][0]).toBe("#0f0");
  });
});
