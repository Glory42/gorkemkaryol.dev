import { useEffect, useMemo } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Menu, Rocket } from "lucide-react";
import { navigationItems } from "@/lib/content";
import { LiveClock } from "@/components/ui/LiveClock";

function isTypingTarget(node: EventTarget | null): boolean {
  if (!(node instanceof HTMLElement)) return false;
  const tag = node.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    node.isContentEditable
  );
}

export function Navbar() {
  const navigate = useNavigate();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const itemsWithShortcuts = useMemo(
    () =>
      navigationItems.map((item) => ({
        ...item,
        shortcut: item.label.charAt(0).toUpperCase(),
      })),
    [],
  );

  const shortcutMap = useMemo(
    () =>
      Object.fromEntries(
        itemsWithShortcuts.map((item) => [item.shortcut, item.href]),
      ) as Record<string, (typeof navigationItems)[number]["href"]>,
    [itemsWithShortcuts],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      ) {
        return;
      }

      if (isTypingTarget(document.activeElement)) return;

      const key = event.key.toUpperCase();
      const route = shortcutMap[key];

      if (!route || route === pathname) return;

      event.preventDefault();
      navigate({ to: route });
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [navigate, pathname, shortcutMap]);

  return (
    <nav
      className="fixed left-0 right-0 top-0 z-50 flex h-[52px] items-center border-b border-[rgba(64,61,82,0.6)] bg-[rgba(25,23,36,0.94)] px-6 backdrop-blur-[16px] md:px-10"
      aria-label="Primary"
    >
      <Link
        to="/"
        className="focus-ring flex items-center gap-[8px] border border-[rgba(196,167,231,0.3)] bg-[rgba(196,167,231,0.08)] px-2 py-[3px] no-underline"
        aria-label="Go to home"
      >
        <span className="flex h-[18px] w-[18px] items-center justify-center border border-[rgba(196,167,231,0.22)] bg-[rgba(196,167,231,0.08)]">
          <Rocket size={10} className="text-[rgba(196,167,231,0.82)]" />
        </span>
        <span className="mono text-[11px] font-normal tracking-[0.12em] text-[rgba(224,222,244,0.85)]">
          gorkemkaryol<span className="text-[rgb(196,167,231)]">.</span>dev
        </span>
      </Link>

      <div className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block">
        <div className="pointer-events-auto flex items-center gap-[3px]">
          {itemsWithShortcuts.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                to={item.href}
                className={`focus-ring relative inline-flex items-center gap-[6px] border px-2 py-[4px] no-underline transition-colors ${
                  isActive
                    ? "border-[rgba(196,167,231,0.36)] bg-[rgba(196,167,231,0.16)] text-[rgba(224,222,244,0.96)]"
                    : "border-[rgba(196,167,231,0.2)] bg-[rgba(196,167,231,0.08)] text-[rgba(196,167,231,0.8)] hover:border-[rgba(196,167,231,0.34)] hover:text-[rgba(224,222,244,0.94)]"
                }`}
                title={`Shortcut: ${item.shortcut}`}
              >
                <span className="mono text-[10px] tracking-[0.04em]">
                  [{item.shortcut}]
                </span>
                <span className="mono text-[10px] uppercase tracking-[0.02em]">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="ml-auto hidden items-center gap-2 md:flex">
        <span className="inline-block h-[5px] w-[5px] rounded-full bg-[rgb(156,207,216)]" />
        <span className="mono text-[9px] tracking-[0.15em] text-[rgba(156,207,216,0.65)]">
          <LiveClock
            location="Europe/Istanbul"
            shortName="UTC+3"
            showAt={false}
            timezoneClassName="text-[rgba(156,207,216,0.65)]"
          />
        </span>
      </div>

      <details className="relative ml-auto md:hidden">
        <summary
          aria-label="Toggle navigation"
          className="focus-ring list-none cursor-pointer p-1 text-[rgba(196,167,231,0.7)]"
        >
          <Menu size={18} />
        </summary>
        <div className="absolute right-0 mt-2 w-52 border border-[rgba(64,61,82,0.9)] bg-[rgba(25,23,36,0.98)] p-2">
          {itemsWithShortcuts.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={`mobile-${item.href}`}
                to={item.href}
                className={`focus-ring mono block px-2 py-2 text-[10px] tracking-[0.08em] no-underline ${
                  isActive
                    ? "text-[rgb(196,167,231)]"
                    : "text-[rgba(196,167,231,0.78)] hover:text-[rgb(224,222,244)]"
                }`}
              >
                [{item.shortcut}] {item.label}
              </Link>
            );
          })}
        </div>
      </details>
    </nav>
  );
}
