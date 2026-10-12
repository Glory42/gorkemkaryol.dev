// A small fzf-flavoured matcher: the query must appear as a case-insensitive
// subsequence of the text. Contiguous runs and word starts score higher, and
// gaps cost a little, so "shel" lands on the "shell" in "playground/shell"
// rather than a scattered s…h…e…l.

export interface FuzzyMatch {
  score: number;
  /** Indices into the text of each matched query character. */
  positions: number[];
}

const BOUNDARY = /[\s/._-]/;

function isWordStart(text: string, i: number): boolean {
  return i === 0 || BOUNDARY.test(text[i - 1]);
}

// Greedy match starting the first query char at `start`; null if it runs out.
function matchFrom(query: string, lower: string, text: string, start: number): FuzzyMatch | null {
  const positions: number[] = [];
  let score = 0;
  let ti = start;

  for (let qi = 0; qi < query.length; qi++) {
    const found = lower.indexOf(query[qi], ti);
    if (found === -1) return null;

    const prev = positions[positions.length - 1];
    score += 1;
    if (prev !== undefined && found === prev + 1) score += 6;
    else if (prev !== undefined) score -= Math.min(3, found - prev - 1) * 0.5;
    if (isWordStart(text, found)) score += 4;

    positions.push(found);
    ti = found + 1;
  }

  return { score, positions };
}

export function fuzzyMatch(rawQuery: string, text: string): FuzzyMatch | null {
  const query = rawQuery.toLowerCase().replace(/\s+/g, "");
  if (!query) return { score: 0, positions: [] };

  const lower = text.toLowerCase();
  let best: FuzzyMatch | null = null;

  // Try every place the first char occurs and keep the best-scoring run.
  for (let i = lower.indexOf(query[0]); i !== -1; i = lower.indexOf(query[0], i + 1)) {
    const match = matchFrom(query, lower, text, i);
    if (!match) break; // later starts can only find fewer chars
    if (!best || match.score > best.score) best = match;
  }

  return best;
}

export interface Ranked<T> extends FuzzyMatch {
  item: T;
}

/** Matching items, best first (ties: shorter text, then original order). */
export function rankByQuery<T>(
  items: readonly T[],
  query: string,
  toText: (item: T) => string,
): Ranked<T>[] {
  const ranked: Array<Ranked<T> & { index: number; length: number }> = [];

  items.forEach((item, index) => {
    const text = toText(item);
    const match = fuzzyMatch(query, text);
    if (match) ranked.push({ ...match, item, index, length: text.length });
  });

  if (!query.trim()) return ranked.map(({ index: _i, length: _l, ...r }) => r);

  return ranked
    .sort((a, b) => b.score - a.score || a.length - b.length || a.index - b.index)
    .map(({ index: _i, length: _l, ...r }) => r);
}
