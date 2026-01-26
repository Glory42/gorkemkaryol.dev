import { 
    LiteralLoginResponse, 
    LiteralBooksResponse, 
    Book, 
    ReadingState 
} from "@/types/literal";

const LITERAL_GRAPHQL_API = "https://api.literal.club/graphql/";

const loginMutation = `
    mutation login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
        token
        profile {
            id
            handle
        }
        }
    }
`;

const booksQuery = `
    query booksByReadingStateAndProfile($limit: Int!, $offset: Int!, $readingStatus: ReadingStatus!, $profileId: String!) {
        booksByReadingStateAndProfile(
        limit: $limit
        offset: $offset
        readingStatus: $readingStatus
        profileId: $profileId
        ) {
        id
        title
        cover
        authors {
            name
        }
        }
    }
`;

async function fetchGraphQL<T = unknown>(
    query: string,
    variables: Record<string, unknown>,
    token?: string,
) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(LITERAL_GRAPHQL_API, {
        method: "POST",
        headers,
        body: JSON.stringify({ query, variables }),
        next: { revalidate: 3600 },
    });

    if (!res.ok) {
        const text = await res.text();
        console.error("Literal API Error:", text.slice(0, 500)); // Log first 500 chars
        throw new Error(`Failed to fetch Literal Data: ${res.status}`);
    }

    return res.json();
}

function validateLiteralEnv(): boolean {
    const email = process.env.LITERAL_EMAIL;
    const password = process.env.LITERAL_PASSWORD;

    if (!email || !password) {
        console.error("Missing LITERAL_EMAIL or LITERAL_PASSWORD");
        console.error(
        "Please ensure these environment variables are set in your .env file:",
        );
        console.error("- LITERAL_EMAIL=your_email@example.com");
        console.error("- LITERAL_PASSWORD=your_literal_password");
        return false;
    }
    return true;
}

export async function getCurrentlyReading(): Promise<ReadingState[]> {
    if (!validateLiteralEnv()) {
        return [];
    }

    const email = process.env.LITERAL_EMAIL!;
    const password = process.env.LITERAL_PASSWORD!;

    try {
        const loginData = await fetchGraphQL<LiteralLoginResponse>(loginMutation, {
        email,
        password,
        });

        const token = loginData.data?.login?.token;
        const profileId = loginData.data?.login?.profile?.id;

        if (!token || !profileId) {
        console.error("Literal Login Failed:", loginData.errors);
        return [];
        }

        const booksData = await fetchGraphQL<LiteralBooksResponse>(
        booksQuery,
        {
            limit: 3,
            offset: 0,
            readingStatus: "IS_READING",
            profileId,
        },
        token,
        );

        const books = booksData.data?.booksByReadingStateAndProfile || [];

        return books.map((book: Book) => ({
        status: "IS_READING",
        book: book,
        }));
    } catch (error) {
        console.error("Error fetching Literal data:", error);
        return [];
    }
}
