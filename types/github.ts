export interface Repository {
    name: string;
    description: string;
    url: string;
    stargazerCount: number;
}

export interface GitHubErrorResponse {
    message: string;
    errors?: Array<{
        message: string;
        type?: string;
    }>;
}

export interface GitHubSearchResponse {
    data?: {
        search?: {
        nodes?: Repository[];
        };
    };
    errors?: GitHubErrorResponse[];
}

export interface GitHubReadmeResponse {
    data?: {
    repository?: {
        object?: {
        text?: string;
        };
    };
    };
    errors?: GitHubErrorResponse[];
}
