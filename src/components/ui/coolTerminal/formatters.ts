import type { QuizQuestion } from "./types";

export function formatHelp(
  commands: Array<{ name: string; description: string }>,
): string {
  return commands
    .map(
      (command) => `${command.name.padEnd(10, " ")} : ${command.description}`,
    )
    .join("\n");
}

export function formatQuizQuestion(
  question: QuizQuestion,
  index: number,
  total: number,
): string {
  return `Q${index + 1}/${total}: ${question.question}\n${question.options
    .map((option) => `  [${option.key.toUpperCase()}] ${option.text}`)
    .join("\n")}\nType a/b/c/d or 'stop'.`;
}
