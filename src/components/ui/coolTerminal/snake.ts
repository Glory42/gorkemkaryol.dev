import type { Direction, Point, SnakeState } from "./types";

export function spawnFood(
  width: number,
  height: number,
  snake: SnakeState["snake"],
) {
  while (true) {
    const x = Math.floor(Math.random() * width);
    const y = Math.floor(Math.random() * height);
    if (!snake.some((part) => part.x === x && part.y === y)) {
      return { x, y };
    }
  }
}

export function createSnakeState(): SnakeState {
  const width = 55;
  const height = 18;
  const snake = [
    { x: 20, y: 9 },
    { x: 19, y: 9 },
    { x: 18, y: 9 },
  ];

  return {
    width,
    height,
    snake,
    food: spawnFood(width, height, snake),
    direction: "right",
    nextDirection: "right",
    score: 0,
    gameOver: false,
  };
}

export function nextHead(head: Point, direction: Direction): Point {
  if (direction === "up") return { x: head.x, y: head.y - 1 };
  if (direction === "down") return { x: head.x, y: head.y + 1 };
  if (direction === "left") return { x: head.x - 1, y: head.y };
  return { x: head.x + 1, y: head.y };
}

export function moveSnake(state: SnakeState): SnakeState {
  if (state.gameOver) return state;

  const direction = state.nextDirection;
  const head = state.snake[0];
  const rawNext = nextHead(head, direction);
  const next = {
    x: (rawNext.x + state.width) % state.width,
    y: (rawNext.y + state.height) % state.height,
  };

  const ateFood = next.x === state.food.x && next.y === state.food.y;
  const bodyToCheck = ateFood ? state.snake : state.snake.slice(0, -1);
  const hitSelf = bodyToCheck.some(
    (part) => part.x === next.x && part.y === next.y,
  );

  if (hitSelf) {
    return { ...state, direction, gameOver: true };
  }

  const grownSnake = [{ x: next.x, y: next.y }, ...state.snake];
  const nextSnake = ateFood ? grownSnake : grownSnake.slice(0, -1);

  return {
    ...state,
    snake: nextSnake,
    direction,
    food: ateFood
      ? spawnFood(state.width, state.height, nextSnake)
      : state.food,
    score: ateFood ? state.score + 1 : state.score,
  };
}

export function renderSnakeBoard(state: SnakeState): string {
  const topBottom = `+${"-".repeat(state.width)}+`;
  const rows: string[] = [];

  for (let y = 0; y < state.height; y += 1) {
    const row: string[] = [];
    for (let x = 0; x < state.width; x += 1) {
      if (state.food.x === x && state.food.y === y) {
        row.push("*");
        continue;
      }

      const index = state.snake.findIndex(
        (part) => part.x === x && part.y === y,
      );
      if (index === 0) {
        row.push("@");
      } else if (index > 0) {
        row.push("o");
      } else {
        row.push(" ");
      }
    }
    rows.push(`|${row.join("")}|`);
  }

  return [topBottom, ...rows, topBottom].join("\n");
}
