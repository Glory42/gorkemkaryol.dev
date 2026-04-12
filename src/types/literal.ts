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
