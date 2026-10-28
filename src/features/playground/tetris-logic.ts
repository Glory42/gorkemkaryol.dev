export type Board = (string | null)[][];
export type Shape = number[][];

export const BOARD_W = 10;
export const BOARD_H = 20;

export function mkBoard(): Board {
  return Array.from({ length: BOARD_H }, () =>
    Array<string | null>(BOARD_W).fill(null),
  );
}

export function rotate(shape: Shape): Shape {
  return shape[0].map((_, i) => shape.map((row) => row[i]).reverse());
}

// Does `shape` fit at (px, py)? Cells above the top edge are allowed while spawning.
export function fits(
  board: Board,
  shape: Shape,
  px: number,
  py: number,
): boolean {
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (!shape[y][x]) continue;
      const nx = px + x;
      const ny = py + y;
      if (nx < 0 || nx >= BOARD_W || ny >= BOARD_H) return false;
      if (ny >= 0 && board[ny][nx]) return false;
    }
  }
  return true;
}

// Drop every full row, push that many empty rows onto the top.
export function clearLines(board: Board): { board: Board; cleared: number } {
  const kept = board.filter((row) => row.some((cell) => cell === null));
  const cleared = BOARD_H - kept.length;
  const empty = Array.from({ length: cleared }, () =>
    Array<string | null>(BOARD_W).fill(null),
  );
  return { board: [...empty, ...kept], cleared };
}

export interface Piece {
  shape: Shape;
  color: string;
  x: number;
  y: number;
}

// Write `piece` into a copy of `board`, then clear any rows it completed.
export function lockPiece(
  board: Board,
  piece: Piece,
): { board: Board; cleared: number } {
  const next = board.map((row) => [...row]);
  piece.shape.forEach((row, dy) =>
    row.forEach((v, dx) => {
      if (v && piece.y + dy >= 0) next[piece.y + dy][piece.x + dx] = piece.color;
    }),
  );
  return clearLines(next);
}

// Rotate in place, else kick one cell right, then left; null when nothing fits.
export function kickRotate(board: Board, piece: Piece): Piece | null {
  const shape = rotate(piece.shape);
  for (const dx of [0, 1, -1]) {
    if (fits(board, shape, piece.x + dx, piece.y)) {
      return { ...piece, shape, x: piece.x + dx };
    }
  }
  return null;
}

const LINE_SCORES = [0, 100, 300, 500, 800];

export function lineClearScore(cleared: number, level: number): number {
  return LINE_SCORES[Math.min(cleared, 4)] * level;
}

/** A level every 10 lines, starting at 1. */
export function levelFor(lines: number): number {
  return Math.floor(lines / 10) + 1;
}

/** Milliseconds between gravity drops; 550 at level 1, floored at 80. */
export function dropIntervalMs(level: number): number {
  return Math.max(80, 550 - (level - 1) * 50);
}
