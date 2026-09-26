import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { pageHead } from "@/components/layout/page";
import { runShellCommand } from "@/features/playground/shell-commands";
import type { ShellSegment } from "@/features/playground/shell-commands";

export const Route = createFileRoute("/playground/shell")({
  head: () => pageHead("shell", "A real prompt, unlike the rest of the site."),
  component: ShellPage,
});

interface Entry {
  cmd: string;
  rows: ShellSegment[][];
}

const INTRO: Entry = {
  cmd: "",
  rows: [[{ text: "a real shell. type 'help' to see what's here." }]],
};

function ShellPage() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<Entry[]>([INTRO]);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [entries]);

  function focusInput() {
    inputRef.current?.focus();
  }

  function submit(cmd: string) {
    const result = runShellCommand(cmd);

    if (result.clear) {
      setEntries([]);
    } else {
      const rows = result.rich ?? result.lines.map((line) => [{ text: line }]);
      setEntries((prev) => [...prev, { cmd, rows }]);
    }

    if (cmd.trim()) {
      setHistory((prev) => [...prev, cmd]);
    }
    setHistoryIndex(-1);

    if (result.navigateTo) {
      window.setTimeout(() => navigate({ to: result.navigateTo as never }), 400);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      submit(value);
      setValue("");
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      const next = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(next);
      setValue(history[next]);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex === -1) return;
      const next = historyIndex + 1;
      if (next >= history.length) {
        setHistoryIndex(-1);
        setValue("");
      } else {
        setHistoryIndex(next);
        setValue(history[next]);
      }
    }
  }

  return (
    <div
      className="mono min-h-[50vh] text-[11px] leading-[2] text-[#555]"
      onClick={focusInput}
    >
      {entries.map((entry, i) => (
        <div key={i}>
          {entry.cmd && <p className="text-accent/[0.7]">~$ {entry.cmd}</p>}
          {entry.rows.length > 0 && (
            <div className="overflow-x-auto">
              {entry.rows.map((row, r) => (
                <div key={r} className="whitespace-pre text-[#666]">
                  {row.map((seg, s) => (
                    <span key={s} style={seg.color ? { color: seg.color } : undefined}>
                      {seg.text}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <div className="flex gap-2">
        <span className="shrink-0 text-accent/[0.7]">~$</span>
        <input
          ref={inputRef}
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          className="mono w-full min-w-0 bg-transparent text-[#666] outline-none"
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
        />
      </div>
      <div ref={bottomRef} />
    </div>
  );
}
