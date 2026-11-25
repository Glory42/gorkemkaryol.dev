import { useEffect, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Search, X } from "lucide-react";
import { ContactLinks } from "@/components/ui/ContactLinks";
import { openCommandPalette } from "@/features/palette/CommandPalette";
import { contactItems } from "@/lib/profile";
import { activeSectionHref, SECTION_LIST } from "@/lib/sections";

// JetBrains Mono's deep descent drops flex-centred icons ~2px; nudge them onto the cap height.
const ICON_NUDGE = "-translate-y-[2px]";

// `scrolled` frosts the bar; `hidden` tucks it away on phones while scrolling down, back on any scroll up.
function useScrollState(): { scrolled: boolean; hidden: boolean } {
  const [state, setState] = useState({ scrolled: false, hidden: false });
  useEffect(() => {
    let last = window.scrollY;
    const update = () => {
      const y = window.scrollY;
      const delta = y - last;
      last = y;
      setState((prev) => {
        const scrolled = y > 4;
        const hidden = y > 120 && (Math.abs(delta) < 4 ? prev.hidden : delta > 0);
        return prev.scrolled === scrolled && prev.hidden === hidden ? prev : { scrolled, hidden };
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return state;
}

const phoneButton = "focus-ring cursor-pointer p-2 text-fg-3 transition-colors hover:text-fg-1";

export function Navbar() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const activeHref = activeSectionHref(pathname);
  const [isOpen, setIsOpen] = useState(false);
  const { scrolled, hidden } = useScrollState();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the phone menu on navigation, Escape, or a tap anywhere outside it.
  useEffect(() => setIsOpen(false), [pathname]);
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false);
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!menuRef.current?.contains(target) && !toggleRef.current?.contains(target))
        setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [isOpen]);

  const path = pathname === "/" ? "" : decodeURIComponent(pathname.replace(/\/$/, ""));

  return (
    <>
      <nav
        className={`fixed left-0 right-0 top-0 z-50 flex h-[var(--nav-h)] items-center justify-center border-b transition-[background-color,border-color,transform] duration-200 focus-within:translate-y-0 ${
          scrolled || isOpen
            ? "border-[rgba(255,255,255,0.06)] bg-black/85 backdrop-blur-md"
            : "border-transparent bg-black"
        } ${hidden && !isOpen ? "max-md:-translate-y-full" : ""}`}
        aria-label="Primary"
      >
        <Link
          to="/"
          aria-label={`Home (you are at ~${path})`}
          className="focus-ring mono absolute left-5 max-w-[calc(100vw-140px)] truncate py-3 text-[12px] text-accent/[0.85] no-underline md:hidden"
        >
          ~{path}
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {SECTION_LIST.map((item) => {
            const isActive = item.href === activeHref;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`focus-ring mono inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] no-underline transition-colors duration-150 ${
                  isActive ? "text-accent" : "text-fg-3 hover:text-fg-1"
                }`}
              >
                <Icon size={11} className={ICON_NUDGE} />
                {item.label}
              </Link>
            );
          })}
        </div>

        <button
          type="button"
          onClick={openCommandPalette}
          aria-label="Open command palette (Ctrl+K)"
          className="focus-ring mono absolute right-5 hidden cursor-pointer text-[11px] tracking-[0.1em] text-fg-4 transition-colors hover:text-accent md:inline-flex"
        >
          ^K
        </button>

        <div className="absolute right-3 flex items-center md:hidden">
          <button
            type="button"
            onClick={openCommandPalette}
            aria-label="Search pages and projects"
            className={phoneButton}
          >
            <Search size={17} />
          </button>
          <button
            ref={toggleRef}
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={isOpen}
            aria-controls="phone-menu"
            onClick={() => setIsOpen((v) => !v)}
            className={phoneButton}
          >
            {isOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Outside <nav>: its backdrop blur and transform would trap these fixed layers inside the bar. */}
      {isOpen && (
        <>
          <div
            aria-hidden="true"
            className="animate-overlay-in fixed inset-x-0 bottom-0 top-[var(--nav-h)] z-40 bg-black/60 md:hidden"
          />
          <div
            ref={menuRef}
            id="phone-menu"
            className="animate-overlay-in-down fixed inset-x-0 top-[var(--nav-h)] z-50 border-b border-[rgba(255,255,255,0.06)] bg-black md:hidden"
          >
            <ul className="m-0 list-none p-0 py-2">
              {SECTION_LIST.map((item) => {
                const isActive = item.href === activeHref;
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={`focus-ring mono flex items-center gap-3 border-l-2 px-5 py-3.5 text-[12px] uppercase tracking-[0.12em] no-underline transition-colors ${
                        isActive
                          ? "border-accent bg-accent/[0.06] text-accent"
                          : "border-transparent text-fg-2 hover:text-white"
                      }`}
                    >
                      <Icon size={13} className={ICON_NUDGE} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-[rgba(255,255,255,0.06)] px-5 py-4">
              <ContactLinks items={contactItems} />
            </div>
          </div>
        </>
      )}
    </>
  );
}
