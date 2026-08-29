import { lazy, Suspense, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

const SnakeGame = lazy(() =>
  import("@/components/ui/games/SnakeGame").then((m) => ({ default: m.SnakeGame })),
);
const FlappyGame = lazy(() =>
  import("@/components/ui/games/FlappyGame").then((m) => ({ default: m.FlappyGame })),
);
const TetrisGame = lazy(() =>
  import("@/components/ui/games/TetrisGame").then((m) => ({ default: m.TetrisGame })),
);

const GAMES = [
  { id: "snake", label: "SNAKE" },
  { id: "flappy", label: "FLAPPY BIRD" },
  { id: "tetris", label: "TETRIS" },
] as const;

type GameId = (typeof GAMES)[number]["id"];

export const Route = createFileRoute("/playground/games")({
  head: () => ({
    meta: [
      { title: "Games | Gorkem Karyol" },
      { name: "description", content: "Snake, Flappy Bird, and Tetris in the browser." },
    ],
  }),
  component: GamesPage,
});

function GamesPage() {
  const [active, setActive] = useState<GameId>("snake");

  return (
    <>
      <div className="mb-8 flex gap-2">
        {GAMES.map((g) => (
          <button
            key={g.id}
            onClick={() => setActive(g.id)}
            className={`mono border px-4 py-2 text-[9px] tracking-[0.15em] transition-colors ${
              active === g.id
                ? "border-accent/[0.5] text-accent"
                : "border-[rgba(255,255,255,0.06)] text-[#333] hover:border-accent/[0.3] hover:text-accent/[0.7]"
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

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
