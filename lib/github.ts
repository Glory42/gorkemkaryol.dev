import { 
    Repository, 
    GitHubErrorResponse, 
    GitHubSearchResponse, 
    GitHubReadmeResponse, 
} from '@/types/github';

const GITHUB_GRAPHQL_API = "https://api.github.com/graphql";

export async function getFeaturedRepos(): Promise<Repository[]> {
    const username = process.env.NEXT_PUBLIC_GITHUB_USERNAME;
    const token = process.env.GITHUB_TOKEN;

    if (!username || !token) {
        console.warn("Missing GITHUB_USERNAME or GITHUB_TOKEN");
        return [];
    }
    
    const query = `
        {
        search(query: "user:${username} topic:featured", type: REPOSITORY, first: 10) {
            nodes {
            ... on Repository {
                name
                description
                url
                stargazerCount
            }
            }
        }
        }
    `;

    try {
        const res = await fetch(GITHUB_GRAPHQL_API, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ query }),
            next: { revalidate: 60 }, 
        });

        if (!res.ok) {
            console.error(`GitHub API Error: ${res.status}`);
            return [];
        }

        // Cast the response to our specific type
        const json = (await res.json()) as GitHubSearchResponse;

        if (json.errors) {
            console.error("GitHub GraphQL Errors:", json.errors);
            return [];
        }

        return json.data?.search?.nodes || [];

    } catch (error) {
        console.error("Network error in getFeaturedRepos:", error);
        return [];
    }
}

export async function getRepoReadme(repoName: string): Promise<string | null> {
    const username = process.env.NEXT_PUBLIC_GITHUB_USERNAME;
    const token = process.env.GITHUB_TOKEN;

    if (!username || !token) return null;

    const query = `
        {
        repository(owner: "${username}", name: "${repoName}") {
            object(expression: "HEAD:README.md") {
            ... on Blob {
                text
            }
            }
        }
        }
    `;

    try {
        const res = await fetch(GITHUB_GRAPHQL_API, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ query }),
            next: { revalidate: 3600 }, 
        });

        const json = (await res.json()) as GitHubReadmeResponse;
        
        return json.data?.repository?.object?.text || null;
    } catch (e) {
        console.error("Error fetching README:", e);
        return null;
    }
}