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

// Can `shape` sit at (px, py) — inside the walls and floor, not overlapping a
// locked cell? Cells above the top edge (ny < 0) are allowed while spawning.
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
