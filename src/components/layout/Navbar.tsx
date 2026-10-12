import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { activeSectionHref, navigationItems } from "@/lib/navigation";

// JetBrains Mono's descent is deep, so flex-centring puts the icon ~2px below
// the middle of the uppercase label; nudge it back up onto the cap height.
const ICON_NUDGE = "-translate-y-[2px]";

export function Navbar() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const activeHref = activeSectionHref(pathname);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav
      className="fixed left-0 right-0 top-0 z-50 flex h-[48px] items-center justify-center bg-black"
      aria-label="Primary"
    >
      <div className="hidden items-center gap-6 md:flex">
        {navigationItems.map((item) => {
          const isActive = item.href === activeHref;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`focus-ring mono inline-flex items-center gap-1.5 text-[11px] tracking-[0.12em] uppercase no-underline transition-colors duration-150 ${
                isActive
                  ? "text-accent"
                  : "text-fg-3 hover:text-fg-1"
              }`}
            >
              <Icon size={11} className={ICON_NUDGE} />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="absolute right-5 md:hidden">
        <button
          aria-label="Toggle navigation"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((v) => !v)}
          className="focus-ring cursor-pointer p-1 text-[rgba(255,255,255,0.4)]"
        >
          {isOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-40 border border-[rgba(255,255,255,0.06)] bg-black p-3">
            {navigationItems.map((item) => {
              const isActive = item.href === activeHref;
              const Icon = item.icon;
              return (
                <Link
                  key={`mobile-${item.href}`}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`focus-ring mono inline-flex items-center gap-2 px-2 py-2 text-[11px] tracking-[0.1em] uppercase no-underline transition-colors ${
                    isActive
                      ? "text-accent"
                      : "text-fg-3 hover:text-white"
                  }`}
                >
                  <Icon size={11} className={ICON_NUDGE} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
