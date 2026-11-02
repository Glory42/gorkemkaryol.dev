// The HTML subset GitHub renders in a README; other tags are dropped, their text kept.
const ALLOWED_TAGS = new Set([
  "a", "b", "blockquote", "br", "code", "dd", "del", "details", "div", "dl",
  "dt", "em", "h1", "h2", "h3", "h4", "h5", "h6", "hr", "i", "img", "ins",
  "kbd", "li", "ol", "p", "picture", "pre", "s", "small", "span", "strike",
  "strong", "sub", "summary", "sup", "table", "tbody", "td", "tfoot", "th",
  "thead", "tr", "tt", "u", "ul",
]);

const ALLOWED_ATTRS = new Set([
  "align", "alt", "colspan", "height", "href", "open", "rowspan", "src",
  "title", "valign", "width",
]);

// Elements whose content is code or markup, not readable text.
const DROP_WITH_CONTENT_RE =
  /<(script|style|iframe|object|embed|template|textarea|noscript)\b[\s\S]*?<\/\1\s*>/gi;

const TAG_RE =
  /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:\s+[^\s"'>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*\/?>/g;

const ATTR_RE =
  /([^\s"'>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", colon: ":", tab: "\t",
  newline: "\n", nbsp: " ",
};

function codePoint(n: number): string {
  return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : "";
}

function decodeEntities(str: string): string {
  return str
    .replace(/&#x([0-9a-f]+);?/gi, (_, hex: string) => codePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);?/g, (_, dec: string) => codePoint(Number(dec)))
    .replace(/&([a-z]+);/gi, (m, name: string) => NAMED_ENTITIES[name.toLowerCase()] ?? m);
}

export function escapeAttr(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Only plain web and mail links; blocks javascript:, data: and friends however they're spelled.
export function isSafeUrl(url: string): boolean {
  const scheme = url.replace(/[\u0000- ]/g, "").match(/^([a-z][a-z0-9+.-]*):/i);
  return !scheme || ["http", "https", "mailto"].includes(scheme[1].toLowerCase());
}

export function isExternalUrl(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
}

export type UrlResolver = (href: string, isImage: boolean) => string;

function sanitizeTag(
  closing: boolean,
  rawName: string,
  rawAttrs: string,
  resolveUrl: UrlResolver,
): string {
  const name = rawName.toLowerCase();
  if (!ALLOWED_TAGS.has(name)) return "";
  if (closing) return `</${name}>`;

  const attrs: string[] = [];
  for (const m of rawAttrs.matchAll(ATTR_RE)) {
    const attr = m[1].toLowerCase();
    if (!ALLOWED_ATTRS.has(attr)) continue;
    let value = decodeEntities(m[2] ?? m[3] ?? m[4] ?? "");
    if (attr === "src" || attr === "href") {
      if (!isSafeUrl(value)) continue;
      value = resolveUrl(value.trim(), attr === "src");
    }
    attrs.push(` ${attr}="${escapeAttr(value)}"`);
  }

  if (name === "img") attrs.push(` loading="lazy"`);
  if (name === "a" && attrs.some((a) => / href="https?:/.test(a))) {
    attrs.push(` target="_blank" rel="noopener noreferrer nofollow"`);
  }
  return `<${name}${attrs.join("")}>`;
}

// Rebuilds README raw HTML from an allowlist so it renders without opening an XSS hole.
export function sanitizeRawHtml(html: string, resolveUrl: UrlResolver): string {
  const input = html.replace(DROP_WITH_CONTENT_RE, "");
  let out = "";
  let last = 0;
  for (const m of input.matchAll(TAG_RE)) {
    out += input.slice(last, m.index).replace(/</g, "&lt;").replace(/>/g, "&gt;");
    if (m[2]) out += sanitizeTag(m[1] === "/", m[2], m[3] ?? "", resolveUrl);
    last = m.index + m[0].length;
  }
  return out + input.slice(last).replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
