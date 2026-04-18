import { requireLiteralEnv, type RuntimeEnv } from "@/lib/env";
import {
  fail,
  ok,
  requestJsonWithRetry,
  type ServiceResult,
} from "@/server/http";

export interface LiteralBook {
  id: string;
  title: string;
  cover: string;
  authors: Array<{ name: string }>;
}

export interface ReadingState {
  status: "IS_READING";
  book: LiteralBook;
}

export interface LiteralReadingPayload {
  profileId: string;
  books: ReadingState[];
}

interface GraphQLError {
  message: string;
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: GraphQLError[];
}

interface LoginMutationData {
  login?: {
    token?: string;
    profile?: {
      id?: string;
    };
  };
}

interface ReadingQueryData {
  booksByReadingStateAndProfile?: Array<{
    id: string;
    title: string;
    cover: string;
    authors: Array<{ name: string }>;
  }>;
}

const LITERAL_GRAPHQL_API = "https://api.literal.club/graphql/";

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

export async function getCurrentlyReading(
  runtimeEnv: RuntimeEnv,
  limit = 3,
): Promise<ServiceResult<LiteralReadingPayload>> {
  const envResult = requireLiteralEnv(runtimeEnv);

  if (!envResult.ok) {
    return fail({
      code: "MISSING_ENV",
      message: envResult.error.message,
      retryable: false,
      details: envResult.error.fields.join(", "),
    });
  }

  const { LITERAL_EMAIL, LITERAL_PASSWORD } = envResult.data;

  const loginResult = await requestJsonWithRetry<
    GraphQLResponse<LoginMutationData>
  >({
    url: LITERAL_GRAPHQL_API,
    method: "POST",
    body: {
      query: LOGIN_MUTATION,
      variables: {
        email: LITERAL_EMAIL,
        password: LITERAL_PASSWORD,
      },
    },
    timeoutMs: 12_000,
    retries: 1,
  });

  if (!loginResult.ok) {
    return loginResult;
  }

  const loginPayload = loginResult.data.data;
  const loginErrors = loginPayload.errors ?? [];

  if (loginErrors.length > 0) {
    return fail({
      code: "UPSTREAM_ERROR",
      message: "Literal login mutation failed",
      retryable: false,
      details: loginErrors.map((error) => error.message).join(" | "),
    });
  }

  const token = loginPayload.data?.login?.token ?? "";
  const profileId = loginPayload.data?.login?.profile?.id ?? "";

  if (!token || !profileId) {
    return fail({
      code: "UNAUTHORIZED",
      message: "Literal login did not return a valid token/profile",
      retryable: false,
    });
  }

  const readingResult = await requestJsonWithRetry<
    GraphQLResponse<ReadingQueryData>
  >({
    url: LITERAL_GRAPHQL_API,
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: {
      query: CURRENTLY_READING_QUERY,
      variables: {
        limit,
        offset: 0,
        readingStatus: "IS_READING",
        profileId,
      },
    },
    timeoutMs: 12_000,
    retries: 1,
  });

  if (!readingResult.ok) {
    return readingResult;
  }

  const readingPayload = readingResult.data.data;
  const readingErrors = readingPayload.errors ?? [];

  if (readingErrors.length > 0) {
    return fail({
      code: "UPSTREAM_ERROR",
      message: "Literal currently-reading query failed",
      retryable: true,
      details: readingErrors.map((error) => error.message).join(" | "),
    });
  }

  const books =
    readingPayload.data?.booksByReadingStateAndProfile?.map((book) => ({
      status: "IS_READING" as const,
      book,
    })) ?? [];

  return ok({ profileId, books });
}
