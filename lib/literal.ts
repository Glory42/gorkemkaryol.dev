const LITERAL_GRAPHQL_API = "https://literal.club/graphql/";

export type Book = {
    id: string;
    title: string;
    subtitle?: string;
    description?: string;
    isbn13?: string;
    cover: string;
    authors: { name: string }[];
};

export type ReadingState = {
    status: string;
    book: Book;
};

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

async function fetchGraphQL(query: string, variables: any, token?: string) {
    const headers: any = {
        "Content-Type": "application/json",
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(LITERAL_GRAPHQL_API, {
        method: "POST",
        headers,
        body: JSON.stringify({ query, variables }),
        next: { revalidate: 3600 }, // Cache for 1 hour
    });

    return res.json();
    }

    export async function getCurrentlyReading() {
    const email = process.env.LITERAL_EMAIL;
    const password = process.env.LITERAL_PASSWORD;

    if (!email || !password) {
        console.error("Missing LITERAL_EMAIL or LITERAL_PASSWORD");
        return [];
    }

    try {
        const loginData = await fetchGraphQL(loginMutation, { email, password });
        
        const token = loginData.data?.login?.token;
        const profileId = loginData.data?.login?.profile?.id;

        if (!token || !profileId) {
        console.error("Literal Login Failed:", loginData.errors);
        return [];
        }

        const booksData = await fetchGraphQL(
        booksQuery, 
        { 
            limit: 3, 
            offset: 0, 
            readingStatus: "IS_READING", 
            profileId 
        }, 
        token
        );

        const books = booksData.data?.booksByReadingStateAndProfile || [];

        return books.map((book: any) => ({
        status: "IS_READING",
        book: book
        }));

    } catch (error) {
        console.error("Error fetching Literal data:", error);
        return [];
    }
}