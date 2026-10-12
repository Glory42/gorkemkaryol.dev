import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { rankByQuery, type Ranked } from "@/features/palette/fuzzy";
import { getPaletteProjectsServerFn } from "@/features/palette/palette-projects";
import { contactItems, DOTFILES_URL } from "@/features/home/content";
import { playgroundEntries } from "@/features/playground/registry";
import { SECTION_LIST } from "@/lib/sections";

// fzf-style jump list: Ctrl/⌘+K (or the unlabelled ^K in the footer) opens it,
// typing fuzzy-filters pages, projects and links, Enter runs the pick.

const OPEN_EVENT = "palette:open";

export function openCommandPalette() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

type Kind = "page" | "project" | "toy" | "link";

interface PaletteItem {
  label: string;
  kind: Kind;
  run: (go: (to: string) => void) => void;
}

function staticItems(): PaletteItem[] {
  const page = (label: string, to: string, kind: Kind = "page"): PaletteItem => ({
    label,
    kind,
    run: (go) => go(to),
  });

  const external = (label: string, href: string): PaletteItem => ({
    label,
    kind: "link",
    run: () => window.open(href, "_blank", "noopener,noreferrer"),
  });

  return [
    ...SECTION_LIST.map((s) => page(`~${s.href === "/" ? "" : s.href}`, s.href)),
    page("~/interests/reading", "/interests/reading"),
    page("~/interests/watching", "/interests/watching"),
    ...playgroundEntries
      .filter((e) => e.status === "live" && e.href)
      .map((e) => page(`~/playground/${e.slug}`, e.href!, "toy")),
    ...contactItems.map<PaletteItem>((c) => ({
      label: `open ${c.label.toLowerCase()}`,
      kind: "link",
      run: () => {
        if (c.href.startsWith("mailto:")) window.location.href = c.href;
        else window.open(c.href, "_blank", "noopener,noreferrer");
      },
    })),
    external("open dotfiles", DOTFILES_URL),
  ];
}

function projectItems(names: string[]): PaletteItem[] {
  return names.map((name) => ({
    label: `~/projects/${name}`,
    kind: "project",
    run: (go) => go(`/projects/${encodeURIComponent(name)}`),
  }));
}

function Highlighted({ text, positions }: { text: string; positions: number[] }) {
  const hits = new Set(positions);
  return (
    <>
      {Array.from(text).map((ch, i) =>
        hits.has(i) ? (
          <span key={i} className="font-bold text-accent">
            {ch}
          </span>
        ) : (
          ch
        ),
      )}
    </>
  );
}

export function CommandPalette() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const [base, setBase] = useState<PaletteItem[]>([]);
  const [projects, setProjects] = useState<PaletteItem[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);
  const openRef = useRef(open);
  openRef.current = open;

  useEffect(() => {
    const show = () => {
      restoreFocus.current = document.activeElement as HTMLElement | null;
      setBase(staticItems());
      setQuery("");
      setCursor(0);
      setOpen(true);
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (openRef.current) setOpen(false);
        else show();
      }
    };
    window.addEventListener(OPEN_EVENT, show);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(OPEN_EVENT, show);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      restoreFocus.current?.focus?.();
      restoreFocus.current = null;
      return;
    }
    inputRef.current?.focus();
    if (projects === null) {
      setProjects([]);
      getPaletteProjectsServerFn()
        .then((names) => setProjects(projectItems(names)))
        .catch(() => setProjects([]));
    }
  }, [open, projects]);

  const items = useMemo(() => [...base, ...(projects ?? [])], [base, projects]);
  const results: Ranked<PaletteItem>[] = useMemo(
    () => rankByQuery(items, query, (item) => item.label),
    [items, query],
  );

  useEffect(() => setCursor(0), [query]);

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${cursor}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  if (!open) return null;

  const close = () => setOpen(false);
  const runAt = (index: number) => {
    const pick = results[index]?.item;
    if (!pick) return;
    close();
    pick.run((to) => navigate({ to: to as never }));
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const down = e.key === "ArrowDown" || (e.ctrlKey && (e.key === "n" || e.key === "j"));
    const up = e.key === "ArrowUp" || (e.ctrlKey && (e.key === "p" || e.key === "k"));
    if (down || up) {
      e.preventDefault();
      e.stopPropagation();
      const n = results.length;
      if (n) setCursor((c) => (c + (down ? 1 : -1) + n) % n);
    } else if (e.key === "Enter") {
      e.preventDefault();
      runAt(cursor);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center bg-black/70 px-4 pt-[14vh] backdrop-blur-[2px] animate-fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="mono w-full max-w-[560px] border border-accent/[0.35] bg-black text-[13px] shadow-[0_0_60px_-10px_rgb(var(--accent-rgb)/0.35)] animate-scale-in"
      >
        <div className="flex items-center gap-2 px-3 pt-3">
          <span className="text-accent">&gt;</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="jump to…"
            aria-label="Search pages, projects and links"
            aria-controls="palette-results"
            aria-activedescendant={results[cursor] ? `palette-${cursor}` : undefined}
            className="w-full min-w-0 bg-transparent text-fg-1 caret-accent outline-none placeholder:text-fg-4"
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
          />
        </div>

        <div className="flex items-center gap-2 px-3 pb-2 pt-1 text-[11px] text-fg-3">
          <span className="text-accent/[0.8]">
            {results.length}/{items.length}
          </span>
          <span className="h-px flex-1 bg-[rgba(255,255,255,0.08)]" />
          {projects?.length === 0 && <span className="text-fg-4">…</span>}
        </div>

        <ul
          ref={listRef}
          id="palette-results"
          role="listbox"
          className="max-h-[50vh] overflow-y-auto pb-2"
        >
          {results.length === 0 && (
            <li className="px-3 py-2 text-fg-4">no matches</li>
          )}
          {results.map((r, i) => {
            const selected = i === cursor;
            return (
              <li
                key={`${r.item.kind}-${r.item.label}`}
                id={`palette-${i}`}
                data-index={i}
                role="option"
                aria-selected={selected}
                onMouseMove={() => setCursor(i)}
                onClick={() => runAt(i)}
                className={`flex cursor-pointer items-center gap-2 px-3 py-[5px] ${
                  selected ? "bg-accent/[0.1] text-fg-1" : "text-fg-2"
                }`}
              >
                <span className={`w-2 shrink-0 ${selected ? "text-accent" : "text-transparent"}`}>
                  ▌
                </span>
                <span className="min-w-0 flex-1 truncate">
                  <Highlighted text={r.item.label} positions={r.positions} />
                </span>
                <span className="shrink-0 text-[10px] tracking-[0.12em] text-fg-4 uppercase">
                  {r.item.kind}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="flex gap-4 border-t border-[rgba(255,255,255,0.06)] px-3 py-2 text-[10px] tracking-[0.08em] text-fg-4">
          <span>↑↓ move</span>
          <span>⏎ open</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  );
}
