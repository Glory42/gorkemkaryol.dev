"use client";

import { useEffect } from "react";
import { useSidebar } from "@/components/providers/SidebarProvider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Footer from "./Footer";

const routes = ["/", "/projects", "/experience", "/interests", "/cool"];

const Sidebar = () => {
  const { isOpen, toggle, setOpen } = useSidebar();
  const pathname = usePathname();

  useEffect(() => {
    if (window.innerWidth < 768) {
      setOpen(false);
    }
  }, [pathname, setOpen]);

  return (
    <>
      <button
        onClick={toggle}
        className="fixed top-6 left-6 z-50 p-2 rounded-md transition-colors hover:bg-neutral-800"
        aria-label="Toggle Sidebar"
      >
        {isOpen ? (
          <X size={25} className="text-white" />
        ) : (
          <Menu size={25} className="text-white" />
        )}
      </button>

      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 h-screen w-64 md:backdrop-blur-none backdrop-blur-xs border-r  border-neutral-800 z-40 pt-20 px-6"
          >
            <nav className="flex flex-col gap-6">
              {routes.map((route, index) => {
                const isActive = pathname === route;
                const displayText = route === "/" ? "me" : route.substring(1);

                return (
                  <Link
                    key={index}
                    href={route}
                    className={`
                                group relative left-3 flex items-center text-lg font-mono tracking-wide py-2 transition-colors
                                ${
                                  isActive
                                    ? "text-white font-medium"
                                    : "text-white md:text-neutral-500 hover:text-white"
                                }
                            `}
                  >
                    <span>
                      <span className="text-neutral-600 mr-2">/</span>
                      {displayText}
                    </span>

                    <span
                      className={`
                                    block absolute left-0 bottom-0 h-0.5 bg-white transition-all duration-300 ease-out
                                    ${isActive ? "w-full" : "w-0 group-hover:w-full"}
                                `}
                    />
                  </Link>
                );
              })}
            </nav>

            <Footer />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
