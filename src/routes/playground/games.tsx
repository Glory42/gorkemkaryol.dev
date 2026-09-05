import { lazy, Suspense, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/components/layout/page";
import { TerminalTabs } from "@/components/ui/TerminalTabs";

const SnakeGame = lazy(() =>
  import("@/features/playground/components/games/SnakeGame").then((m) => ({ default: m.SnakeGame })),
);
const FlappyGame = lazy(() =>
  import("@/features/playground/components/games/FlappyGame").then((m) => ({ default: m.FlappyGame })),
);
const TetrisGame = lazy(() =>
  import("@/features/playground/components/games/TetrisGame").then((m) => ({ default: m.TetrisGame })),
);

const GAMES = [
  { id: "snake", label: "SNAKE" },
  { id: "flappy", label: "FLAPPY BIRD" },
  { id: "tetris", label: "TETRIS" },
] as const;

type GameId = (typeof GAMES)[number]["id"];

export const Route = createFileRoute("/playground/games")({
  head: () =>
    pageHead("Games", "Snake, Flappy Bird, and Tetris in the browser."),
  component: GamesPage,
});

function GamesPage() {
  const [active, setActive] = useState<GameId>("snake");

  return (
    <>
      <TerminalTabs
        options={GAMES}
        value={active}
        onChange={setActive}
        className="mb-8"
      />

      <div className="flex min-h-[480px] items-center justify-center">
        <Suspense fallback={<p className="mono text-[11px] text-[#333]">loading...</p>}>
          {active === "snake" && <SnakeGame />}
          {active === "flappy" && <FlappyGame />}
          {active === "tetris" && <TetrisGame />}
        </Suspense>
      </div>
    </>
  );
}
