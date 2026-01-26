const GITHUB_GRAPHQL_API = "https://api.github.com/graphql";

export async function getFeaturedRepos() {
    const username = process.env.NEXT_PUBLIC_GITHUB_USERNAME;
    
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

    const res = await fetch(GITHUB_GRAPHQL_API, {
        method: "POST",
        headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
        next: { revalidate: 60 }, 
    });

    const { data } = await res.json();
    return data.search.nodes;
}

// 2. Fetch README Content for a specific repo
export async function getRepoReadme(repoName: string) {
    const username = process.env.NEXT_PUBLIC_GITHUB_USERNAME;

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

    const res = await fetch(GITHUB_GRAPHQL_API, {
        method: "POST",
        headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
        next: { revalidate: 3600 }, 
    });

    const { data } = await res.json();
    return data.repository?.object?.text;
}