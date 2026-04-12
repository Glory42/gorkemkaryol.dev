import type { Direction, QuizQuestion } from "./types";

export const BANNER = [
  "   ______            __",
  "  / ____/___  ____  / /__",
  " / /   / __ \\/ __ \\/ / _ \\",
  "/ /___/ /_/ / /_/ / /  __/",
  "\\____/\\____/\\____/_/\\___/",
].join("\n");

export const COMMANDS: Array<{ name: string; description: string }> = [
  { name: "help", description: "Show available commands" },
  { name: "snake", description: "Start snake game (arrows/WASD)" },
  { name: "quiz", description: "Start quick terminal quiz" },
  { name: "train", description: "Run live ASCII train animation" },
  { name: "stop", description: "Stop active game or animation" },
  { name: "clear", description: "Clear terminal output" },
  { name: "exit", description: "Alias for stop" },
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: "Which language powers this portfolio server utilities?",
    options: [
      { key: "a", text: "Go" },
      { key: "b", text: "TypeScript" },
      { key: "c", text: "Rust" },
      { key: "d", text: "Python" },
    ],
    answer: "b",
  },
  {
    question: "Which command starts the ASCII train animation?",
    options: [
      { key: "a", text: "rail" },
      { key: "b", text: "locomotive" },
      { key: "c", text: "train" },
      { key: "d", text: "track" },
    ],
    answer: "c",
  },
  {
    question: "What command prints all available commands?",
    options: [
      { key: "a", text: "list" },
      { key: "b", text: "help" },
      { key: "c", text: "commands" },
      { key: "d", text: "manual" },
    ],
    answer: "b",
  },
];

export const QUIZ_ANSWERS = ["a", "b", "c", "d"] as const;

export const OPPOSITES: Record<Direction, Direction> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

export const TRAIN_TICK_MS = 120;
export const SNAKE_TICK_MS = 130;
