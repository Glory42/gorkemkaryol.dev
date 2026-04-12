import { postJson } from "@/lib/server/http";
import { getLiteralCredentials } from "@/lib/utils/env";
import type { ReadingState } from "@/types/literal";

const LITERAL_GRAPHQL_API = "https://api.literal.club/graphql/";

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message?: string }>;
}

interface LoginResult {
  login?: {
    token?: string;
    profile?: {
      id?: string;
    };
  };
}

interface ReadingResult {
  booksByReadingStateAndProfile?: Array<{
    id: string;
    title: string;
    cover: string;
    authors: Array<{ name: string }>;
  }>;
}

const LOGIN_MUTATION = `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      profile {
        id
      }
    }
  }
`;

const CURRENTLY_READING_QUERY = `
  query BooksByReadingStateAndProfile(
    $limit: Int!
    $offset: Int!
    $readingStatus: ReadingStatus!
    $profileId: String!
  ) {
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

export async function getCurrentlyReading(limit = 3): Promise<ReadingState[]> {
  const result = await getCurrentlyReadingWithStatus(limit);
  return result.books;
}

export async function getCurrentlyReadingWithStatus(limit = 3): Promise<{
  books: ReadingState[];
  hasError: boolean;
}> {
  const credentials = getLiteralCredentials();
  if (!credentials) return { books: [], hasError: false };

  try {
    const loginResponse = await postJson<GraphQLResponse<LoginResult>>(
      LITERAL_GRAPHQL_API,
      {
        query: LOGIN_MUTATION,
        variables: {
          email: credentials.email,
          password: credentials.password,
        },
      },
    );

    if (loginResponse.errors?.length) {
      console.error("Literal login errors:", loginResponse.errors);
      return { books: [], hasError: true };
    }

    const token = loginResponse.data?.login?.token;
    const profileId = loginResponse.data?.login?.profile?.id;

    if (!token || !profileId) return { books: [], hasError: true };

    const booksResponse = await postJson<GraphQLResponse<ReadingResult>>(
      LITERAL_GRAPHQL_API,
      {
        query: CURRENTLY_READING_QUERY,
        variables: {
          limit,
          offset: 0,
          readingStatus: "IS_READING",
          profileId,
        },
      },
      {
        Authorization: `Bearer ${token}`,
      },
    );

    if (booksResponse.errors?.length) {
      console.error("Literal books errors:", booksResponse.errors);
      return { books: [], hasError: true };
    }

    const books =
      booksResponse.data?.booksByReadingStateAndProfile?.map((book) => ({
        status: "IS_READING" as const,
        book,
      })) ?? [];

    return { books, hasError: false };
  } catch (error) {
    console.error("Failed to fetch Literal reading state:", error);
    return { books: [], hasError: true };
  }
}
