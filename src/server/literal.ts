import { requireLiteralEnv, type RuntimeEnv } from "@/lib/env";
import {
  fail,
  ok,
  requestJsonWithRetry,
  type ServiceResult,
} from "@/server/http";

export interface LiteralBook {
  id: string;
  slug: string;
  title: string;
  cover: string;
  authors: Array<{ name: string }>;
}

export interface ReadingState {
  status: "IS_READING";
  book: LiteralBook;
}

export interface LiteralData {
  currentlyReading: ReadingState[];
  favoriteBooks: LiteralBook[];
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
    slug: string;
    title: string;
    cover: string;
    authors: Array<{ name: string }>;
  }>;
}

interface ShelfBySlugQueryData {
  shelf?: {
    id: string;
    slug: string;
    books: Array<{
      id: string;
      slug: string;
      title: string;
      cover: string;
      authors: Array<{ name: string }>;
    }>;
  };
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
      slug
      title
      cover
      authors {
        name
      }
    }
  }
`;

const SHELF_BY_SLUG_QUERY = `
  query getShelfBySlug($shelfSlug: String!) {
    shelf(where: { slug: $shelfSlug }) {
      id
      slug
      books {
        id
        slug
        title
        cover
        authors {
          name
        }
      }
    }
  }
`;

const LITERAL_CACHE_KEY = "https://portfolio.cache/literal-data-v1";
const LITERAL_CACHE_TTL = 600;
const LITERAL_TOKEN_CACHE_KEY = "https://portfolio.cache/literal-token-v1";
const LITERAL_TOKEN_CACHE_TTL = 3600;

interface CachedToken {
  token: string;
  profileId: string;
}

async function getLiteralToken(
  cache: Cache,
  email: string,
  password: string,
): Promise<ServiceResult<CachedToken>> {
  const cached = await cache.match(LITERAL_TOKEN_CACHE_KEY).catch(() => null);
  if (cached) {
    const result = await cached.json().catch(() => null) as CachedToken | null;
    if (result?.token && result?.profileId) return ok(result);
  }

  const loginResult = await requestJsonWithRetry<
    GraphQLResponse<LoginMutationData>
  >({
    url: LITERAL_GRAPHQL_API,
    method: "POST",
    body: {
      query: LOGIN_MUTATION,
      variables: { email, password },
    },
    timeoutMs: 12_000,
    retries: 1,
  });

  if (!loginResult.ok) return loginResult;

  const loginPayload = loginResult.data.data;
  const loginErrors = loginPayload.errors ?? [];

  if (loginErrors.length > 0) {
    return fail({
      code: "UPSTREAM_ERROR",
      message: "Literal login mutation failed",
      retryable: false,
      details: loginErrors.map((e) => e.message).join(" | "),
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

  const tokenData: CachedToken = { token, profileId };
  cache.put(
    LITERAL_TOKEN_CACHE_KEY,
    new Response(JSON.stringify(tokenData), {
      headers: { "Cache-Control": `max-age=${LITERAL_TOKEN_CACHE_TTL}` },
    }),
  ).catch(() => {});

  return ok(tokenData);
}

export async function getLiteralData(
  runtimeEnv: RuntimeEnv,
  readingLimit = 3,
): Promise<ServiceResult<LiteralData>> {
  const cache = (caches as unknown as { default: Cache }).default;
  const cached = await cache.match(LITERAL_CACHE_KEY).catch(() => null);
  if (cached) {
    const result = await cached.json().catch(() => null);
    if (result) return result as ServiceResult<LiteralData>;
  }

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

  const tokenResult = await getLiteralToken(cache, LITERAL_EMAIL, LITERAL_PASSWORD);
  if (!tokenResult.ok) return tokenResult;

  const { token, profileId } = tokenResult.data;

  const [readingResult, shelfResult] = await Promise.all([
    requestJsonWithRetry<GraphQLResponse<ReadingQueryData>>({
      url: LITERAL_GRAPHQL_API,
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: {
        query: CURRENTLY_READING_QUERY,
        variables: {
          limit: readingLimit,
          offset: 0,
          readingStatus: "IS_READING",
          profileId,
        },
      },
      timeoutMs: 12_000,
      retries: 1,
    }),
    requestJsonWithRetry<GraphQLResponse<ShelfBySlugQueryData>>({
      url: LITERAL_GRAPHQL_API,
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: {
        query: SHELF_BY_SLUG_QUERY,
        variables: { shelfSlug: "favorits-b4k6z82" },
      },
      timeoutMs: 12_000,
      retries: 1,
    }),
  ]);

  if (!readingResult.ok) return readingResult;
  if (!shelfResult.ok) return shelfResult;

  const readingErrors = readingResult.data.data.errors ?? [];
  if (readingErrors.length > 0) {
    return fail({
      code: "UPSTREAM_ERROR",
      message: "Literal currently-reading query failed",
      retryable: true,
      details: readingErrors.map((e) => e.message).join(" | "),
    });
  }

  const shelvesErrors = shelfResult.data.data.errors ?? [];
  if (shelvesErrors.length > 0) {
    return fail({
      code: "UPSTREAM_ERROR",
      message: "Literal shelves query failed",
      retryable: true,
      details: shelvesErrors.map((e) => e.message).join(" | "),
    });
  }

  const currentlyReading =
    readingResult.data.data.data?.booksByReadingStateAndProfile?.map(
      (book) => ({ status: "IS_READING" as const, book }),
    ) ?? [];

  const favoriteBooks = (shelfResult.data.data.data?.shelf?.books ?? []).slice(0, 2);

  const result = ok({ currentlyReading, favoriteBooks });
  cache.put(
    LITERAL_CACHE_KEY,
    new Response(JSON.stringify(result), {
      headers: { "Cache-Control": `max-age=${LITERAL_CACHE_TTL}` },
    }),
  ).catch(() => {});
  return result;
}

export async function getCurrentlyReading(
  runtimeEnv: RuntimeEnv,
  limit = 3,
): Promise<ServiceResult<{ profileId: string; books: ReadingState[] }>> {
  const result = await getLiteralData(runtimeEnv, limit);
  if (!result.ok) return result;
  return ok({ profileId: "", books: result.data.currentlyReading });
}
