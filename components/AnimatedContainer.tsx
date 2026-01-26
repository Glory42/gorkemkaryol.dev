"use client";

import { motion } from "framer-motion";
import { AnimatedContainerProps, AnimatedElementProps } from "@/types";

export const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export const staggerContainer = {
    visible: { transition: { staggerChildren: 0.4 } },
};

export default function AnimatedContainer({
    children,
    className,
}: AnimatedContainerProps) {
    return (
        <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className={className}
        >
        {children}
        </motion.div>
    );
}

export function AnimatedElement({ children, className }: AnimatedElementProps) {
    return (
        <motion.div variants={fadeInUp} className={className}>
        {children}
        </motion.div>
    );
}
