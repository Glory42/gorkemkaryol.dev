import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Section accent — resolves from `--accent-rgb` on the [data-accent]
        // wrapper. `<alpha-value>` lets `text-accent/60`, `border-accent/[0.4]`
        // etc. work like any other Tailwind colour.
        accent: "rgb(var(--accent-rgb) / <alpha-value>)",
        // Text scale from tokens.css (1 = brightest, 4 = faintest).
        fg: {
          1: "var(--text-1)",
          2: "var(--text-2)",
          3: "var(--text-3)",
          4: "var(--text-4)",
        },
      },
      fontFamily: {
        sans: ["Sora", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
