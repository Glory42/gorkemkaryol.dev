export interface RepoRef {
  owner: string;
  name: string;
}

// Repos owned by other accounts that still belong in the projects list.
export const EXTERNAL_REPOS: RepoRef[] = [
  { owner: "WasteWise-Project", name: "WasteWise" },
  { owner: "gdg-on-campus-halic", name: "gdg-on-campus-halic-web" },
];

// The one place a slug becomes owner/name: a listed external repo, else `username`'s own.
export function resolveRepo(slug: string, username: string): RepoRef {
  const wanted = slug.toLowerCase();
  return (
    EXTERNAL_REPOS.find((repo) => repo.name.toLowerCase() === wanted) ?? {
      owner: username,
      name: slug,
    }
  );
}
