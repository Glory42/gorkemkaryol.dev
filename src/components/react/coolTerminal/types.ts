export type LogKind = "system" | "success" | "error" | "command";

export interface LogLine {
  id: number;
  kind: LogKind;
  text: string;
}

export type Mode = "idle" | "snake" | "quiz" | "train";
export type Direction = "up" | "down" | "left" | "right";

export interface Point {
  x: number;
  y: number;
}

export interface SnakeState {
  width: number;
  height: number;
  snake: Point[];
  food: Point;
  direction: Direction;
  nextDirection: Direction;
  score: number;
  gameOver: boolean;
}

export type QuizAnswer = "a" | "b" | "c" | "d";

export interface QuizQuestion {
  question: string;
  options: Array<{ key: QuizAnswer; text: string }>;
  answer: QuizAnswer;
}

export interface QuizState {
  index: number;
  score: number;
}
