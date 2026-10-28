import { describe, expect, it } from "vitest";
import {
  BOARD_H,
  BOARD_W,
  clearLines,
  dropIntervalMs,
  fits,
  kickRotate,
  levelFor,
  lineClearScore,
  lockPiece,
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

describe("lockPiece", () => {
  it("writes the piece into a copy of the board", () => {
    const board = mkBoard();
    const locked = lockPiece(board, { shape: [[1, 1]], color: "c", x: 0, y: BOARD_H - 1 });
    expect(locked.board[BOARD_H - 1].slice(0, 2)).toEqual(["c", "c"]);
    expect(locked.cleared).toBe(0);
    expect(board[BOARD_H - 1][0]).toBeNull();
  });

  it("clears the row the piece completes", () => {
    const board = mkBoard();
    board[BOARD_H - 1] = Array(BOARD_W).fill("x");
    board[BOARD_H - 1][0] = null;
    const locked = lockPiece(board, { shape: [[1]], color: "c", x: 0, y: BOARD_H - 1 });
    expect(locked.cleared).toBe(1);
    expect(locked.board[BOARD_H - 1].every((cell) => cell === null)).toBe(true);
  });
});

describe("kickRotate", () => {
  it("rotates in place when there is room", () => {
    const rotated = kickRotate(mkBoard(), { shape: [[1, 1, 1, 1]], color: "c", x: 3, y: 5 });
    expect(rotated).toMatchObject({ x: 3, shape: [[1], [1], [1], [1]] });
  });

  it("nudges off a wall, and gives up when boxed in", () => {
    const tee = { shape: [[1, 0], [1, 1], [1, 0]], color: "c", x: BOARD_W - 2, y: 5 };
    const board = mkBoard();
    board[5][BOARD_W - 3] = "x";
    expect(kickRotate(board, tee)).toBeNull();

    const kicked = kickRotate(mkBoard(), { ...tee, x: BOARD_W - 2, shape: [[1], [1], [1]] });
    expect(kicked?.x).toBe(BOARD_W - 3);
  });
});

describe("scoring and speed", () => {
  it("pays more per line for bigger clears, scaled by level", () => {
    expect(lineClearScore(1, 1)).toBe(100);
    expect(lineClearScore(4, 2)).toBe(1600);
    expect(lineClearScore(0, 5)).toBe(0);
  });

  it("levels up every 10 lines and drops faster, floored at 80ms", () => {
    expect(levelFor(0)).toBe(1);
    expect(levelFor(19)).toBe(2);
    expect(dropIntervalMs(1)).toBe(550);
    expect(dropIntervalMs(30)).toBe(80);
  });
});
