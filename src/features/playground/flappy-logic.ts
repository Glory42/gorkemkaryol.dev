export const W = 280;
export const H = 420;
export const BIRD_X = 65;
export const BIRD_R = 10;
export const PIPE_W = 44;
export const GAP = 118;

const GRAVITY = 0.38;
const JUMP_VEL = -7.2;
const PIPE_SPEED = 2.2;
const PIPE_EVERY = 88;

export type Pipe = { x: number; topH: number; passed: boolean };

export interface FlappyState {
  y: number;
  vy: number;
  pipes: Pipe[];
  frame: number;
  score: number;
}

export function newFlappy(): FlappyState {
  return { y: H / 2, vy: -3, pipes: [], frame: 0, score: 0 };
}

export function flap(state: FlappyState): FlappyState {
  return { ...state, vy: JUMP_VEL };
}

function hits(y: number, pipes: Pipe[]): boolean {
  if (y - BIRD_R <= 0 || y + BIRD_R >= H) return true;
  return pipes.some(
    (p) =>
      BIRD_X + BIRD_R > p.x + 2 &&
      BIRD_X - BIRD_R < p.x + PIPE_W - 2 &&
      (y - BIRD_R < p.topH || y + BIRD_R > p.topH + GAP),
  );
}

// One frame: gravity, spawn a pipe every PIPE_EVERY frames, scroll, score each
// pipe the bird clears, then die on the ceiling, floor or a pipe.
export function stepFlappy(
  state: FlappyState,
  rand: () => number = Math.random,
): FlappyState | "over" {
  const vy = state.vy + GRAVITY;
  const y = state.y + vy;
  const frame = state.frame + 1;

  const spawned =
    frame % PIPE_EVERY === 0
      ? [...state.pipes, { x: W + 10, topH: 55 + rand() * (H - GAP - 110), passed: false }]
      : state.pipes;

  let score = state.score;
  const pipes = spawned
    .map((p) => ({ ...p, x: p.x - PIPE_SPEED }))
    .filter((p) => p.x + PIPE_W > -10)
    .map((p) => {
      if (p.passed || p.x + PIPE_W >= BIRD_X - BIRD_R) return p;
      score += 1;
      return { ...p, passed: true };
    });

  if (hits(y, pipes)) return "over";
  return { y, vy, pipes, frame, score };
}
