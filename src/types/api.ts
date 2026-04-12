import type { ReadingState } from "@/types/literal";

export interface BooksApiSuccess {
  books: ReadingState[];
}

export interface BooksApiError {
  error: string;
  books: ReadingState[];
}
