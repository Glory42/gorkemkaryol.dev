import js from "@eslint/js";
import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";

export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      ".astro/**",
      ".next/**",
      "coverage/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs["flat/recommended"],
  {
    files: ["**/*.{ts,tsx,astro,mjs}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
);
