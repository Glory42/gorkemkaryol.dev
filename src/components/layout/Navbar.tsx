import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { navigationItems } from "@/lib/content";

export function Navbar() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav
      className="fixed left-0 right-0 top-0 z-50 flex h-[48px] items-center justify-center bg-black"
      aria-label="Primary"
    >
      <div className="hidden items-center gap-6 md:flex">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`focus-ring mono inline-flex items-center gap-1.5 text-[10px] tracking-[0.12em] uppercase no-underline transition-colors duration-150 ${
                isActive
                  ? "text-white"
                  : "text-[rgba(255,255,255,0.28)] hover:text-[rgba(255,255,255,0.65)]"
              }`}
            >
              <Icon size={11} />
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
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={`mobile-${item.href}`}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`focus-ring mono inline-flex items-center gap-2 px-2 py-2 text-[10px] tracking-[0.1em] uppercase no-underline transition-colors ${
                    isActive
                      ? "text-white"
                      : "text-[rgba(255,255,255,0.3)] hover:text-white"
                  }`}
                >
                  <Icon size={11} />
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
