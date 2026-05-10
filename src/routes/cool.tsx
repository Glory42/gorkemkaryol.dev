import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { FlappyGame } from "@/components/ui/games/FlappyGame";
import { SnakeGame } from "@/components/ui/games/SnakeGame";
import { TetrisGame } from "@/components/ui/games/TetrisGame";

const GAMES = [
  { id: "snake", label: "SNAKE" },
  { id: "flappy", label: "FLAPPY BIRD" },
  { id: "tetris", label: "TETRIS" },
] as const;

type GameId = (typeof GAMES)[number]["id"];

export const Route = createFileRoute("/cool")({
  head: () => ({
    meta: [
      { title: "Cool | Gorkem Karyol" },
      { name: "description", content: "Games to kill time." },
    ],
  }),
  component: CoolPage,
});

function CoolPage() {
  const [active, setActive] = useState<GameId>("snake");

  return (
    <PageShell mainClassName="px-[max(24px,4vw)] pb-8 pt-[max(12px,1.5vh)]">
      <section className="mx-auto max-w-[900px]">
        <p className="mono mb-5 text-[11px] text-[#252525]">~$ cd ./cool</p>

        <div className="mb-8 flex gap-2">
          {GAMES.map(g => (
            <button
              key={g.id}
              onClick={() => setActive(g.id)}
              className={`mono border px-4 py-2 text-[9px] tracking-[0.15em] transition-colors ${
                active === g.id
                  ? "border-[rgba(168,85,247,0.5)] text-[#a855f7]"
                  : "border-[rgba(255,255,255,0.06)] text-[#333] hover:border-[rgba(168,85,247,0.3)] hover:text-[rgba(168,85,247,0.7)]"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>

        <div className="flex min-h-[480px] items-center justify-center">
          {active === "snake" && <SnakeGame />}
          {active === "flappy" && <FlappyGame />}
          {active === "tetris" && <TetrisGame />}
        </div>
      </section>
    </PageShell>
  );
}
