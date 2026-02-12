"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CoolPage() {
  const [count, setCount] = useState(0);
  const [showImage, setShowImage] = useState(false);

  const messages = [
    "Don't touch this button",
    "I said don't!",
    "Don't you dare!",
    "Seriously, stop it.",
    "I AM WARNING YOU!",
  ];

  const handleClick = () => {
    if (count < 4) {
      setCount((prev) => prev + 1);
    } else {
      setShowImage(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center overflow-hidden relative">
      <AnimatePresence mode="wait">
        {!showImage ? (
          <motion.button
            key="button"
            onClick={handleClick}
            layout
            initial={{ scale: 1 }}
            animate={{
              scale: 1 + count * 0.2,
              rotate: count % 2 === 0 ? 0 : [0, -5, 5, 0],
              backgroundColor: count === 4 ? "#ef4444" : "#171717",
            }}
            whileHover={{ scale: 1 + count * 0.2 + 0.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
                px-8 py-4 rounded-xl font-bold font-mono text-white border border-neutral-700
                shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-colors duration-300
                ${count === 4 ? "bg-red-500 border-red-400 text-black animate-pulse" : "bg-neutral-900"}
                `}
          >
            {messages[count]}
          </motion.button>
        ) : (
          <motion.div
            key="image"
            initial={{ opacity: 0, scale: 0, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
            className="relative w-full max-w-2xl aspect-video pr-0 p-4"
          >
            <div className="relative w-full h-full overflow-hidden shadow-2xl border-2 border-white/10 rounded-lg">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="Rick Roll"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full object-cover"
              />
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mt-8 text-neutral-400 font-mono"
            >
              Cool Cool Cool Cool Cool Cool
            </motion.p>

            <button
              onClick={() => {
                setShowImage(false);
                setCount(0);
              }}
              className="absolute -bottom-14 left-1/2 -translate-x-1/2 text-xs text-neutral-600 hover:text-white transition-colors"
            >
              [ reset system ]
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
