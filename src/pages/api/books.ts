import type { APIRoute } from "astro";
import { getCurrentlyReadingWithStatus } from "@/lib/server/literal";
import type { BooksApiError, BooksApiSuccess } from "@/types/api";

export const prerender = false;

export const GET: APIRoute = async () => {
  const { books, hasError } = await getCurrentlyReadingWithStatus(3);

  if (hasError) {
    const payload: BooksApiError = {
      error: "Failed to fetch books",
      books,
    };

    return new Response(JSON.stringify(payload), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    });
  }

  const payload: BooksApiSuccess = { books };

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=7200",
    },
  });
};
