/**
 * Repositories owned by other accounts that should still appear in the
 * projects list. Consumed by `src/server/github.ts` to build per-repo GraphQL
 * aliases and to resolve the correct owner when fetching a README.
 */
export const EXTERNAL_REPOS = [
  "WasteWise-Project/WasteWise",
];
