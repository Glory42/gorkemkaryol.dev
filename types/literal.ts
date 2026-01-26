export interface Book {
    id: string;
    title: string;
    subtitle?: string;
    description?: string;
    isbn13?: string;
    cover: string;
    authors: { name: string }[];
}

export interface ReadingState {
    status: string;
    book: Book;
}

export interface LiteralLoginResponse {
    data?: {
        login?: {
        token: string;
        profile?: {
            id: string;
            handle: string;
        };
        };
    };
    errors?: unknown[];
}

export interface LiteralBooksResponse {
    data?: {
        booksByReadingStateAndProfile?: Book[];
    };
    errors?: unknown[];
}
