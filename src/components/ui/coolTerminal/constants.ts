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
  { name: "quiz", description: "Star Wars quiz — 10 questions" },
  { name: "train", description: "Run live ASCII train animation" },
  { name: "stop", description: "Stop active game or animation" },
  { name: "clear", description: "Clear terminal output" },
  { name: "exit", description: "Alias for stop" },
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: "Who is Luke Skywalker's father?",
    options: [
      { key: "a", text: "Obi-Wan Kenobi" },
      { key: "b", text: "Emperor Palpatine" },
      { key: "c", text: "Darth Vader" },
      { key: "d", text: "Han Solo" },
    ],
    answer: "c",
  },
  {
    question: "What is the name of Han Solo's ship?",
    options: [
      { key: "a", text: "X-Wing" },
      { key: "b", text: "Millennium Falcon" },
      { key: "c", text: "Star Destroyer" },
      { key: "d", text: "TIE Fighter" },
    ],
    answer: "b",
  },
  {
    question: "Which planet is Luke Skywalker from?",
    options: [
      { key: "a", text: "Coruscant" },
      { key: "b", text: "Naboo" },
      { key: "c", text: "Hoth" },
      { key: "d", text: "Tatooine" },
    ],
    answer: "d",
  },
  {
    question: "What color is Mace Windu's lightsaber?",
    options: [
      { key: "a", text: "Blue" },
      { key: "b", text: "Green" },
      { key: "c", text: "Red" },
      { key: "d", text: "Purple" },
    ],
    answer: "d",
  },
  {
    question: "What order commanded all clone troopers to kill the Jedi?",
    options: [
      { key: "a", text: "Order 65" },
      { key: "b", text: "Order 66" },
      { key: "c", text: "Order 67" },
      { key: "d", text: "Order 99" },
    ],
    answer: "b",
  },
  {
    question: "Who trained Obi-Wan Kenobi as his Jedi Master?",
    options: [
      { key: "a", text: "Yoda" },
      { key: "b", text: "Mace Windu" },
      { key: "c", text: "Qui-Gon Jinn" },
      { key: "d", text: "Count Dooku" },
    ],
    answer: "c",
  },
  {
    question: "What is Darth Vader's original birth name?",
    options: [
      { key: "a", text: "Count Dooku" },
      { key: "b", text: "Kylo Ren" },
      { key: "c", text: "Mace Windu" },
      { key: "d", text: "Anakin Skywalker" },
    ],
    answer: "d",
  },
  {
    question: "Which planet was destroyed by the Death Star in Episode IV?",
    options: [
      { key: "a", text: "Naboo" },
      { key: "b", text: "Coruscant" },
      { key: "c", text: "Alderaan" },
      { key: "d", text: "Mustafar" },
    ],
    answer: "c",
  },
  {
    question: "What is the Mandalorian's real name?",
    options: [
      { key: "a", text: "Boba Fett" },
      { key: "b", text: "Din Djarin" },
      { key: "c", text: "Jango Fett" },
      { key: "d", text: "Bo-Katan Kryze" },
    ],
    answer: "b",
  },
  {
    question: "In which film does Darth Vader say 'I am your father'?",
    options: [
      { key: "a", text: "A New Hope" },
      { key: "b", text: "The Empire Strikes Back" },
      { key: "c", text: "Return of the Jedi" },
      { key: "d", text: "Revenge of the Sith" },
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
