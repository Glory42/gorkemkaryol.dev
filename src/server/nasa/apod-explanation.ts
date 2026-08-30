import type { RuntimePort } from "@/server/common/runtime";

const DAY = 86_400;

// NASA's APOD JSON API drops a word's first letter when the source HTML
// hyperlinks it ("Eclipses" -> "clipses"). On that signature, re-read the real
// text from the APOD web page and cache the repair for the day.
export async function resolveApodExplanation(
  apiText: string,
  date: string,
  runtime: RuntimePort,
): Promise<string> {
  if (!apiText || !/^[a-z]/.test(apiText)) return apiText;

  const key = `apod-expl:${date}`;
  const hit = await runtime.cache.get<string>(key);
  if (hit !== undefined) return hit;

  try {
    const stamp = date.slice(2).replace(/-/g, "");
    const res = await runtime.http.fetch(
      `https://apod.nasa.gov/apod/ap${stamp}.html`,
    );
    if (res.ok) {
      const match = (await res.text()).match(
        /Explanation:\s*<\/b>\s*([\s\S]*?)\s*<p>/i,
      );
      const text = match?.[1]
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      // Only cache a real repair; on failure fall through and retry next call.
      if (text && text.length >= apiText.length) {
        await runtime.cache.set(key, text, DAY);
        return text;
      }
    }
  } catch {
    // Keep the API's text as-is on any failure.
  }
  return apiText;
}
