import { requireEnv, type RuntimeEnv } from "@/lib/env";
import { envFail, fail, ok, type ServiceResult } from "@/server/common/http";
import {
  defineSource,
  type SourceClient,
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

type LiteralCredentials = ServiceResult<{ email: string; password: string }>;

function literalCredentials(runtimeEnv: RuntimeEnv): LiteralCredentials {
  const result = requireEnv(runtimeEnv, ["LITERAL_EMAIL", "LITERAL_PASSWORD"]);
  if (!result.ok) return envFail(result.error);
  return ok({
    email: result.data.LITERAL_EMAIL,
    password: result.data.LITERAL_PASSWORD,
  });
}

const literalClient = defineSource({
  envKeys: ["LITERAL_EMAIL", "LITERAL_PASSWORD"],
  scope: (e) => `literal:${e.LITERAL_EMAIL}`,
  base: () => LITERAL_GRAPHQL_API,
  defaultTtl: 3600,
  timeoutMs: 12_000,
  retries: 1,
});

interface LiteralSession {
  client: SourceClient;
  authHeaders: { Authorization: string };
  profileId: string;
}

// Log in once, then run `use` with an authenticated client. Both public reads
// share this so the token dance lives in one place.
export async function withLiteralSession<T>(
  env: RuntimeEnv,
  ctx: SourceCtx,
  use: (session: LiteralSession) => Promise<ServiceResult<T>>,
): Promise<ServiceResult<T>> {
  const credentials = literalCredentials(env);
  const client = literalClient(env, ctx);
  const tokenResult = await getLiteralToken(client, credentials);
  if (!tokenResult.ok) return tokenResult;

  return use({
    client,
    authHeaders: { Authorization: `Bearer ${tokenResult.data.token}` },
    profileId: tokenResult.data.profileId,
  });
}

async function getLiteralToken(
  client: SourceClient,
  credentials: LiteralCredentials,
): Promise<ServiceResult<{ token: string; profileId: string }>> {
  if (!credentials.ok) return fail(credentials.error);

  const result = await client.gql<LoginMutationData>(LOGIN_MUTATION, {
    variables: {
      email: credentials.data.email,
      password: credentials.data.password,
    },
    ttl: 1200,
    label: "Literal login",
  });

  if (!result.ok) return result;

  const token = result.data.login?.token ?? "";
  const profileId = result.data.login?.profile?.id ?? "";

  if (!token || !profileId) {
    return fail({
      code: "UNAUTHORIZED",
      message: "Literal login did not return a valid token/profile",
      retryable: false,
    });
  }

  return ok({ token, profileId });
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
  return withLiteralSession(env, ctx, async ({ client, authHeaders, profileId }) => {
    const [reading, shelf] = await Promise.all([
      client.gql<ReadingQueryData>(CURRENTLY_READING_QUERY, {
        headers: authHeaders,
        variables: readingVariables(profileId, readingLimit, "IS_READING"),
        label: "Literal currently-reading",
      }),
      client.gql<ShelfBySlugQueryData>(SHELF_BY_SLUG_QUERY, {
        headers: authHeaders,
        variables: { shelfSlug: "favorits-b4k6z82" },
        label: "Literal shelves",
      }),
    ]);

    if (!reading.ok) return reading;
    if (!shelf.ok) return shelf;

    return ok({
      currentlyReading: (reading.data.booksByReadingStateAndProfile ?? []).map(
        (book) => ({ status: "IS_READING" as const, book }),
      ),
      favoriteBooks: (shelf.data.shelf?.books ?? []).slice(0, 2),
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
  return withLiteralSession(env, ctx, async ({ client, authHeaders, profileId }) => {
    const [reading, finished] = await Promise.all([
      client.gql<ReadingQueryData>(CURRENTLY_READING_QUERY, {
        headers: authHeaders,
        variables: readingVariables(profileId, 50, "IS_READING"),
        label: "Literal currently-reading",
      }),
      client.gql<ReadingQueryData>(CURRENTLY_READING_QUERY, {
        headers: authHeaders,
        variables: readingVariables(profileId, finishedLimit, "FINISHED"),
        label: "Literal finished-books",
      }),
    ]);

    if (!reading.ok) return reading;
    if (!finished.ok) return finished;

    return ok({
      currentlyReading: reading.data.booksByReadingStateAndProfile ?? [],
      finishedBooks: finished.data.booksByReadingStateAndProfile ?? [],
    });
  });
}
