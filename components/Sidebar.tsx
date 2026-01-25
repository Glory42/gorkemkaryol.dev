"use client";

import { useSidebar } from "@/components/providers/SidebarProvider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react"; 
import Footer from './Footer';

const routes = [ "/", "/me", "/projects", "/experience", "/interests", "/cool" ];

const Sidebar = () => {
    const { isOpen, toggle } = useSidebar();
    const pathname = usePathname();

    return (
        <>
            <button
                onClick={toggle}
                className="fixed top-6 left-6 z-50 p-2 rounded-md transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                aria-label="Toggle Sidebar"
            >
                {isOpen ? <X size={25} className="text-black dark:text-white"/> :  <Menu size={25} className="text-black dark:text-white"/>}
            </button>

            <AnimatePresence mode="wait">
                {isOpen && (
                <motion.aside
                    initial={{ x: -300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -300, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed top-0 left-0 h-screen w-64 md:backdrop-blur-none backdrop-blur-xs border-r border-neutral-200 dark:border-neutral-800 z-40 pt-20 px-6"
                >
                    <nav className="flex flex-col gap-6">
                    {routes.map((route, index) => {
                        const isActive = pathname === route;
                        const displayText = route === "/" ? "home" : route.substring(1);

                        return (
                        <Link 
                            key={index} 
                            href={route}
                            className={`
                                group relative left-3 flex items-center text-lg font-mono tracking-wide py-2 transition-colors
                                ${isActive 
                                    ? "text-black dark:text-white font-medium" 
                                    : "text-white md:text-neutral-500 hover:text-black dark:hover:text-white"}
                            `}
                        >
                            <span>
                                <span className="text-neutral-300 dark:text-neutral-600 mr-2">/</span>
                                {displayText}
                            </span>
                            
                            <span 
                                className={`
                                    block absolute left-0 bottom-0 h-0.5 bg-black dark:bg-white transition-all duration-300 ease-out
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
}

export default Sidebar;