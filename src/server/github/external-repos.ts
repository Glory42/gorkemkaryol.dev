export interface RepoRef {
  owner: string;
  name: string;
}

// Repos owned by other accounts that still belong in the projects list.
// `github.ts` builds per-repo GraphQL aliases from these.
export const EXTERNAL_REPOS: RepoRef[] = [
  { owner: "WasteWise-Project", name: "WasteWise" },
  { owner: "gdg-on-campus-halic", name: "gdg-on-campus-halic-web" },
];

// The one place a project slug becomes owner/name: a listed external repo
// (case-insensitive, like GitHub), else a repo owned by `username`.
export function resolveRepo(slug: string, username: string): RepoRef {
  const wanted = slug.toLowerCase();
  return (
    EXTERNAL_REPOS.find((repo) => repo.name.toLowerCase() === wanted) ?? {
      owner: username,
      name: slug,
    }
  );
}
