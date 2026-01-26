"use client";

import React from 'react';
import Link from "next/link";
import { motion } from "framer-motion";


const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
};

const Homebar: React.FC<{ routes: string[] }> = ({ routes }) => {
  return (
    <nav className="mt-8 w-full max-w-4xl">
        <motion.ul
            className="flex flex-col items-center gap-2 md:flex-row md:justify-center md:gap-8 text-3xl tracking-wide"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {routes.map((route, index) => {
                const displayText = route === "/" ? "Home" : route.substring(1);

                return (
                    <motion.li
                        key={index}
                        variants={itemVariants}
                    >
                        <Link
                            href={route}
                            className="relative inline-block text-lg p-2 rounded-lg transition-colors duration-300 ease-in-out group"
                            id="na-buttons"
                            data-umami-event={route}
                        >
                            {`/${displayText}`}
                            <span className="block absolute left-0 bottom-0 w-0 h-0.5 bg-black dark:bg-white transition-all duration-300 ease-out group-hover:w-full"></span>
                        </Link>
                    </motion.li>
                );
            })}
        </motion.ul>
    </nav>
  );
};

export default Homebar;