import type { RuntimeEnv } from "@/lib/env";
import { allOk, fail, ok, type ServiceResult } from "@/server/common/http";
import {
  defineSource,
  type GqlOptions,
  type SourceCtx,
} from "@/server/common/source";

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

interface LoginMutationData {
  login?: {
    token?: string;
    profile?: { id?: string };
  };
}

interface ReadingQueryData {
  booksByReadingStateAndProfile?: LiteralBook[];
}

interface ShelfBySlugQueryData {
  shelf?: {
    id: string;
    slug: string;
    books: LiteralBook[];
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

const literalClient = defineSource({
  envKeys: ["LITERAL_EMAIL", "LITERAL_PASSWORD"],
  scope: (e) => `literal:${e.LITERAL_EMAIL}`,
  base: () => LITERAL_GRAPHQL_API,
  defaultTtl: 3600,
  timeoutMs: 12_000,
  retries: 1,
});

interface LiteralSession {
  /** `gql` with the session's bearer token attached. */
  gql: <T>(query: string, options?: GqlOptions) => Promise<ServiceResult<T>>;
  profileId: string;
}

// Log in once (cached; the client guard fails it with MISSING_ENV first when
// credentials are unset), then run `use` with an authenticated gql.
export async function withLiteralSession<T>(
  env: RuntimeEnv,
  ctx: SourceCtx,
  use: (session: LiteralSession) => Promise<ServiceResult<T>>,
): Promise<ServiceResult<T>> {
  const client = literalClient(env, ctx);
  const login = await client.gql<LoginMutationData>(LOGIN_MUTATION, {
    variables: { email: env.LITERAL_EMAIL, password: env.LITERAL_PASSWORD },
    ttl: 1200,
    label: "Literal login",
  });
  if (!login.ok) return login;

  const token = login.data.login?.token ?? "";
  const profileId = login.data.login?.profile?.id ?? "";
  if (!token || !profileId) {
    return fail({
      code: "UNAUTHORIZED",
      message: "Literal login did not return a valid token/profile",
      retryable: false,
    });
  }

  const auth = { Authorization: `Bearer ${token}` };
  return use({
    profileId,
    gql: (query, options = {}) =>
      client.gql(query, { ...options, headers: { ...options.headers, ...auth } }),
  });
}

function readingVariables(
  profileId: string,
  limit: number,
  readingStatus: "IS_READING" | "FINISHED",
) {
  return { limit, offset: 0, readingStatus, profileId };
}

export async function getLiteralData(
  env: RuntimeEnv,
  ctx: SourceCtx,
  readingLimit = 3,
): Promise<ServiceResult<LiteralData>> {
  return withLiteralSession(env, ctx, async ({ gql, profileId }) => {
    const result = await allOk({
      reading: gql<ReadingQueryData>(CURRENTLY_READING_QUERY, {
        variables: readingVariables(profileId, readingLimit, "IS_READING"),
        label: "Literal currently-reading",
      }),
      shelf: gql<ShelfBySlugQueryData>(SHELF_BY_SLUG_QUERY, {
        variables: { shelfSlug: "favorits-b4k6z82" },
        label: "Literal shelves",
      }),
    });
    if (!result.ok) return result;
    const { reading, shelf } = result.data;

    return ok({
      currentlyReading: (reading.booksByReadingStateAndProfile ?? []).map(
        (book) => ({ status: "IS_READING" as const, book }),
      ),
      favoriteBooks: (shelf.shelf?.books ?? []).slice(0, 2),
    });
  });
}

export async function getAllBooksData(
  env: RuntimeEnv,
  ctx: SourceCtx,
  finishedLimit = 1000,
): Promise<
  ServiceResult<{ currentlyReading: LiteralBook[]; finishedBooks: LiteralBook[] }>
> {
  return withLiteralSession(env, ctx, async ({ gql, profileId }) => {
    const result = await allOk({
      reading: gql<ReadingQueryData>(CURRENTLY_READING_QUERY, {
        variables: readingVariables(profileId, 50, "IS_READING"),
        label: "Literal currently-reading",
      }),
      finished: gql<ReadingQueryData>(CURRENTLY_READING_QUERY, {
        variables: readingVariables(profileId, finishedLimit, "FINISHED"),
        label: "Literal finished-books",
      }),
    });
    if (!result.ok) return result;
    const { reading, finished } = result.data;

    return ok({
      currentlyReading: reading.booksByReadingStateAndProfile ?? [],
      finishedBooks: finished.booksByReadingStateAndProfile ?? [],
    });
  });
}
