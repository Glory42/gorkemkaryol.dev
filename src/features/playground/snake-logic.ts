export const COLS = 24;
export const ROWS = 24;

export type Dir = "U" | "D" | "L" | "R";
export type Mode = "walls" | "wrap";
export type Pt = { x: number; y: number };

export interface SnakeState {
  snake: Pt[];
  dir: Dir;
  /** The turn queued for the next step; applied once, so a fast double-turn can't reverse. */
  next: Dir;
  food: Pt;
  score: number;
  mode: Mode;
}

const OPPOSITE: Record<Dir, Dir> = { U: "D", D: "U", L: "R", R: "L" };
const DELTA: Record<Dir, Pt> = {
  U: { x: 0, y: -1 },
  D: { x: 0, y: 1 },
  L: { x: -1, y: 0 },
  R: { x: 1, y: 0 },
};

export function randFood(snake: Pt[], rand: () => number = Math.random): Pt {
  let p: Pt;
  do {
    p = { x: (rand() * COLS) | 0, y: (rand() * ROWS) | 0 };
  } while (snake.some((s) => s.x === p.x && s.y === p.y));
  return p;
}

export function newSnake(mode: Mode, rand: () => number = Math.random): SnakeState {
  const snake = [{ x: 12, y: 12 }, { x: 11, y: 12 }, { x: 10, y: 12 }];
  return { snake, dir: "R", next: "R", food: randFood(snake, rand), score: 0, mode };
}

/** Queue a turn; turning straight back into the body is ignored. */
export function turn(state: SnakeState, dir: Dir): SnakeState {
  return OPPOSITE[dir] === state.dir ? state : { ...state, next: dir };
}

// One tick: move, die on a wall (walls mode) or the body, grow on food, else drop the tail.
export function stepSnake(
  state: SnakeState,
  rand: () => number = Math.random,
): SnakeState | "over" {
  const dir = state.next;
  let x = state.snake[0].x + DELTA[dir].x;
  let y = state.snake[0].y + DELTA[dir].y;

  if (state.mode === "wrap") {
    x = (x + COLS) % COLS;
    y = (y + ROWS) % ROWS;
  } else if (x < 0 || x >= COLS || y < 0 || y >= ROWS) {
    return "over";
  }

  if (state.snake.some((p) => p.x === x && p.y === y)) return "over";

  const grown = [{ x, y }, ...state.snake];
  if (x === state.food.x && y === state.food.y) {
    return {
      ...state,
      dir,
      snake: grown,
      food: randFood(grown, rand),
      score: state.score + 1,
    };
  }
  return { ...state, dir, snake: grown.slice(0, -1) };
}
