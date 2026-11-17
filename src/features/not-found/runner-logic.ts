export const W = 600;
export const H = 160;
export const GROUND_Y = 136;
export const PLAYER_X = 48;
export const PLAYER_W = 18;
export const PLAYER_H = 22;
/** Fixed simulation step, so speed doesn't change with the monitor's refresh rate. */
export const FRAME_MS = 1000 / 60;

const GRAVITY = 0.65;
const JUMP_VEL = 10.5;
const JUMP_CUT = 4;
const JUMP_BUFFER = 6;
const START_SPEED = 5.5;
const MAX_SPEED = 12;
const SPEED_GAIN = 0.00035;
/** Distance before dropped packets start flying in. */
const PACKETS_FROM = 1500;
const HIT_INSET = 3;

// `lift` is the gap between an obstacle's bottom and the ground: 0 = firewall, > 0 = packet.
export type Obstacle = { x: number; w: number; h: number; lift: number };

export interface RunnerState {
  /** Player's height above the ground. */
  lift: number;
  /** Upward velocity. */
  vy: number;
  speed: number;
  distance: number;
  obstacles: Obstacle[];
  /** Pixels left until the next obstacle spawns. */
  gap: number;
  /** Frames a jump pressed mid-air stays queued for the landing. */
  buffer: number;
}

export function newRunner(): RunnerState {
  return {
    lift: 0,
    vy: 0,
    speed: START_SPEED,
    distance: 0,
    obstacles: [],
    gap: W * 0.6,
    buffer: 0,
  };
}

export const runnerScore = (state: RunnerState): number =>
  Math.floor(state.distance / 10);

const grounded = (state: RunnerState): boolean => state.lift === 0 && state.vy === 0;

/** Jump from the ground, or queue one if pressed just before landing. */
export function jump(state: RunnerState): RunnerState {
  if (grounded(state)) return { ...state, vy: JUMP_VEL, buffer: 0 };
  return { ...state, buffer: JUMP_BUFFER };
}

/** Letting go early cuts the climb short, for a small hop. */
export function releaseJump(state: RunnerState): RunnerState {
  return state.vy > JUMP_CUT ? { ...state, vy: JUMP_CUT } : state;
}

function spawn(distance: number, rand: () => number): Obstacle {
  const x = W + 10;
  if (distance > PACKETS_FROM && rand() < 0.25) {
    // High packets pass over a standing player; low ones have to be jumped.
    const lift = rand() < 0.5 ? PLAYER_H + 6 : 8;
    return { x, w: 22, h: 12, lift };
  }
  const blocks = distance > 800 && rand() < 0.3 ? 2 + Math.floor(rand() * 2) : 1;
  return { x, w: blocks * (12 + Math.floor(rand() * 6)), h: 18 + Math.floor(rand() * 22), lift: 0 };
}

export function hits(lift: number, o: Obstacle): boolean {
  const left = PLAYER_X + HIT_INSET;
  const right = PLAYER_X + PLAYER_W - HIT_INSET;
  const bottom = lift + 2;
  const top = lift + PLAYER_H - HIT_INSET;
  return right > o.x && left < o.x + o.w && top > o.lift && bottom < o.lift + o.h;
}

// One frame: jump physics, speed ramp, scroll and spawn obstacles, die on contact.
export function stepRunner(
  state: RunnerState,
  rand: () => number = Math.random,
): RunnerState | "over" {
  let { vy, lift, buffer } = state;
  if (buffer > 0 && grounded(state)) {
    vy = JUMP_VEL;
    buffer = 0;
  }
  if (lift > 0 || vy > 0) {
    vy -= GRAVITY;
    lift = Math.max(0, lift + vy);
    if (lift === 0) vy = 0;
  }
  buffer = Math.max(0, buffer - 1);

  const speed = Math.min(MAX_SPEED, START_SPEED + state.distance * SPEED_GAIN);
  const distance = state.distance + speed;
  let gap = state.gap - speed;
  let obstacles = state.obstacles
    .map((o) => ({ ...o, x: o.x - speed }))
    .filter((o) => o.x + o.w > -10);
  if (gap <= 0) {
    obstacles = [...obstacles, spawn(distance, rand)];
    gap = speed * 32 + 80 + rand() * speed * 24;
  }

  if (obstacles.some((o) => hits(lift, o))) return "over";
  return { lift, vy, speed, distance, obstacles, gap, buffer };
}
