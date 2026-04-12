export interface FeaturedRepository {
  name: string;
  description: string;
  url: string;
  stargazerCount: number;
  topics: string[];
  primaryLanguage?: {
    name: string;
    color?: string | null;
  } | null;
  updatedAt: string;
}

export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ContributionCalendar {
  totalContributions: number;
  days: ContributionDay[];
}

export interface RepoReadmeData {
  owner: string;
  repo: string;
  defaultBranch: string;
  repoUrl: string;
  readme: string | null;
}
