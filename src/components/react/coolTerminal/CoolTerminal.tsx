import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  BANNER,
  COMMANDS,
  OPPOSITES,
  QUIZ_ANSWERS,
  QUIZ_QUESTIONS,
  SNAKE_TICK_MS,
  TRAIN_TICK_MS,
} from "./constants";
import { formatHelp, formatQuizQuestion } from "./formatters";
import { createSnakeState, moveSnake, renderSnakeBoard } from "./snake";
import { renderTrainFrame } from "./train";
import type {
  Direction,
  LogKind,
  LogLine,
  Mode,
  QuizAnswer,
  QuizState,
  SnakeState,
} from "./types";

const QUIZ_ANSWER_SET = new Set<string>(QUIZ_ANSWERS);

function isQuizAnswer(value: string): value is QuizAnswer {
  return QUIZ_ANSWER_SET.has(value);
}

export default function CoolTerminal() {
  const [logs, setLogs] = useState<LogLine[]>(() => [
    { id: 1, kind: "system", text: BANNER },
    { id: 2, kind: "system", text: "Type 'help' to see available commands." },
  ]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("idle");
  const [snakeState, setSnakeState] = useState<SnakeState>(createSnakeState);
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [trainFrame, setTrainFrame] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const snakeEndAnnouncedRef = useRef(false);
  const nextIdRef = useRef(3);

  const pushLog = (kind: LogKind, text: string) => {
    setLogs((prev) => [...prev, { id: nextIdRef.current++, kind, text }]);
  };

  const stopInteractiveMode = () => {
    setMode("idle");
    setQuizState(null);
  };

  const printQuizQuestion = (index: number) => {
    const question = QUIZ_QUESTIONS[index];
    if (!question) return;

    pushLog(
      "system",
      formatQuizQuestion(question, index, QUIZ_QUESTIONS.length),
    );
  };

  const printHelp = () => {
    pushLog("system", formatHelp(COMMANDS));
  };

  const executeCommand = (rawCommand: string) => {
    const command = rawCommand.trim();
    if (!command) return;

    pushLog("command", `$ ${command}`);

    const lower = command.toLowerCase();

    if (mode === "quiz" && quizState) {
      if (lower === "stop" || lower === "exit") {
        stopInteractiveMode();
        pushLog("system", "Quiz aborted.");
        return;
      }

      if (isQuizAnswer(lower)) {
        const question = QUIZ_QUESTIONS[quizState.index];
        const isCorrect = question?.answer === lower;
        const score = isCorrect ? quizState.score + 1 : quizState.score;

        pushLog(
          isCorrect ? "success" : "error",
          isCorrect
            ? "Correct."
            : `Wrong. Correct answer: ${question?.answer.toUpperCase()}.`,
        );

        if (quizState.index >= QUIZ_QUESTIONS.length - 1) {
          setQuizState(null);
          setMode("idle");
          pushLog(
            "system",
            `Quiz complete. Score: ${score}/${QUIZ_QUESTIONS.length}. Type 'quiz' to play again.`,
          );
          return;
        }

        const next = { index: quizState.index + 1, score };
        setQuizState(next);
        printQuizQuestion(next.index);
        return;
      }

      pushLog("error", "Quiz mode expects a, b, c, d, stop, or exit.");
      return;
    }

    switch (lower) {
      case "help":
        printHelp();
        break;

      case "clear":
        setLogs([]);
        break;

      case "snake":
        setSnakeState(createSnakeState());
        snakeEndAnnouncedRef.current = false;
        setMode("snake");
        setQuizState(null);
        pushLog(
          "system",
          "Snake started. Use arrow keys or WASD. Type 'stop' to exit.",
        );
        break;

      case "quiz":
        setMode("quiz");
        setTrainFrame(0);
        setQuizState({ index: 0, score: 0 });
        printQuizQuestion(0);
        break;

      case "train":
        setMode("train");
        setQuizState(null);
        setTrainFrame(0);
        pushLog("system", "Live train stream started. Type 'stop' to halt.");
        break;

      case "stop":
      case "exit":
        if (mode === "idle") {
          pushLog("system", "No active mode to stop.");
        } else {
          stopInteractiveMode();
          pushLog("system", "Active mode stopped.");
        }
        break;

      default:
        pushLog(
          "error",
          `Unknown command: ${command}. Type 'help' for available commands.`,
        );
        break;
    }
  };

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [logs, mode, snakeState, trainFrame, quizState]);

  useEffect(() => {
    if (mode !== "train") return;
    const timer = window.setInterval(() => {
      setTrainFrame((frame) => frame + 1);
    }, TRAIN_TICK_MS);
    return () => window.clearInterval(timer);
  }, [mode]);

  useEffect(() => {
    if (mode !== "snake" || snakeState.gameOver) return;

    const timer = window.setInterval(() => {
      setSnakeState((current) => moveSnake(current));
    }, SNAKE_TICK_MS);

    return () => window.clearInterval(timer);
  }, [mode, snakeState.gameOver]);

  useEffect(() => {
    if (mode !== "snake") return;

    const onKeyDown = (event: KeyboardEvent) => {
      const map: Record<string, Direction | undefined> = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
        w: "up",
        s: "down",
        a: "left",
        d: "right",
      };

      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      const nextDirection = map[key];
      if (!nextDirection) return;

      event.preventDefault();
      setSnakeState((current) => {
        if (OPPOSITES[current.direction] === nextDirection) {
          return current;
        }
        return { ...current, nextDirection };
      });
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mode]);

  useEffect(() => {
    if (
      mode !== "snake" ||
      !snakeState.gameOver ||
      snakeEndAnnouncedRef.current
    )
      return;
    snakeEndAnnouncedRef.current = true;
    pushLog(
      "error",
      `Snake crashed. Final score: ${snakeState.score}. Type 'snake' to retry or 'stop' to exit.`,
    );
  }, [mode, snakeState.gameOver, snakeState.score]);

  const activePanel = useMemo(() => {
    if (mode === "snake") {
      return {
        title: "snake mode",
        body: `${renderSnakeBoard(snakeState)}\n\nscore: ${snakeState.score}`,
      };
    }

    if (mode === "train") {
      return {
        title: "live ascii",
        body: renderTrainFrame(trainFrame),
      };
    }

    if (mode === "quiz") {
      return {
        title: "quiz mode",
        body: "Answer by typing a, b, c, or d and press Enter.",
      };
    }

    return null;
  }, [mode, snakeState, trainFrame]);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    executeCommand(input);
    setInput("");
  };

  return (
    <section className="mx-auto w-full max-w-[860px] border border-[rgba(64,61,82,0.95)] bg-[rgba(25,23,36,0.96)] shadow-[0_18px_45px_rgba(8,8,14,0.5)]">
      <header className="flex items-center justify-between border-b border-[rgba(64,61,82,0.8)] bg-[rgba(38,35,58,0.9)] px-3 py-2 text-[rgba(224,222,244,0.78)]">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[rgba(235,111,146,0.85)]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[rgba(246,193,119,0.85)]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[rgba(156,207,216,0.85)]" />
        </div>
        <span className="mono text-[10px] tracking-[0.1em]">
          gorkemkaryol@portfolio
        </span>
        <span className="mono text-[10px] tracking-[0.08em] text-[rgba(144,140,170,0.9)]">
          archlinux
        </span>
      </header>

      <div
        className="h-[52vh] min-h-[320px] max-h-[520px] overflow-y-auto bg-[rgba(25,23,36,0.98)] px-4  text-[rgb(188,194,207)]"
        ref={scrollRef}
        onClick={() => inputRef.current?.focus()}
      >
        <div className="mt-3 space-y-2">
          {logs.map((line) => (
            <pre
              key={line.id}
              className={`mono m-0 whitespace-pre-wrap text-[11px] leading-[1.42] ${
                line.kind === "command"
                  ? "text-[rgb(156,207,216)]"
                  : line.kind === "error"
                    ? "text-[rgb(235,111,146)]"
                    : line.kind === "success"
                      ? "text-[rgb(49,116,143)]"
                      : "text-[rgba(224,222,244,0.88)]"
              }`}
            >
              {line.text}
            </pre>
          ))}
        </div>

        {activePanel && (
          <div className="mt-4 border border-[rgba(64,61,82,0.75)] bg-[rgba(31,29,46,0.92)] p-3">
            <p className="mono mb-2 text-[9px] uppercase tracking-[0.16em] text-[rgba(196,167,231,0.8)]">
              {activePanel.title}
            </p>
            <pre className="mono m-0 whitespace-pre text-[10px] leading-[1.35] text-[rgba(224,222,244,0.87)]">
              {activePanel.body}
            </pre>
          </div>
        )}

        <form
          onSubmit={onSubmit}
          className="mt-4 flex items-center gap-2 border-t border-[rgba(64,61,82,0.7)] pt-2"
        >
          <span className="mono text-[12px] text-[rgb(156,207,216)]">$</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="mono min-w-0 flex-1 border-none bg-transparent text-[11px] text-[rgba(224,222,244,0.9)] outline-none"
            autoComplete="off"
            spellCheck={false}
            aria-label="Terminal command input"
          />
        </form>
      </div>
    </section>
  );
}
