import { Marked } from "marked";

function escapeAttr(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// GitHub-style heading slug: lowercase, punctuation dropped, spaces to hyphens.
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function buildMarked(
  owner: string,
  repo: string,
  branch: string,
  repoUrl: string,
): Marked {
  const rawBase = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}`;
  const blobBase = `${repoUrl}/blob/${branch}`;

  function resolveUrl(href: string, isImage: boolean): string {
    if (
      !href ||
      href.startsWith("http://") ||
      href.startsWith("https://") ||
      href.startsWith("//") ||
      href.startsWith("/") ||
      href.startsWith("#")
    ) {
      return href;
    }
    // No repo context (a hand-authored project page, not a GitHub README) —
    // there's nothing to resolve a relative path against, so leave it as-is.
    if (!owner || !repo) return href;
    const clean = href.replace(/^\.\//, "");
    return isImage ? `${rawBase}/${clean}` : `${blobBase}/${clean}`;
  }

  const instance = new Marked();

  // Give every heading a stable id so a README's own table-of-contents links
  // (`#set-up-the-frontend`) have something to scroll to. Dupes get -1, -2.
  const slugCounts = new Map<string, number>();
  function uniqueSlug(text: string): string {
    const base = slugify(text) || "section";
    const n = slugCounts.get(base) ?? 0;
    slugCounts.set(base, n + 1);
    return n === 0 ? base : `${base}-${n}`;
  }

  instance.use({
    renderer: {
      heading({ tokens, depth }) {
        // Slug from the rendered text (tags stripped in slugify), so a linked
        // heading `## [Title](url)` still slugs to `title`, matching GitHub.
        const inner = this.parser.parseInline(tokens);
        const id = escapeAttr(uniqueSlug(inner));
        return `<h${depth} id="${id}">${inner}</h${depth}>\n`;
      },
      html({ text }) {
        // Escape raw HTML blocks to prevent XSS from malicious READMEs.
        // Markdown-generated HTML (tables, code blocks, etc.) is safe and unaffected.
        return text
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
      },
      image({ href, title, text }) {
        const src = escapeAttr(resolveUrl(href ?? "", true));
        const alt = escapeAttr(text ?? "");
        const titleAttr = title ? ` title="${escapeAttr(title)}"` : "";
        return `<img src="${src}" alt="${alt}"${titleAttr} loading="lazy" />`;
      },
      link({ href, title, tokens }) {
        const resolved = resolveUrl(href ?? "", false);
        const isExternal =
          resolved.startsWith("http://") || resolved.startsWith("https://");
        const safeHref = escapeAttr(resolved);
        const titleAttr = title ? ` title="${escapeAttr(title)}"` : "";
        const externalAttrs = isExternal
          ? ` target="_blank" rel="noopener noreferrer nofollow"`
          : "";
        // Render the inner tokens, not the raw text, so `[![badge](img)](url)`
        // keeps its nested image instead of printing literal markdown.
        const inner = this.parser.parseInline(tokens);
        return `<a href="${safeHref}"${titleAttr}${externalAttrs}>${inner}</a>`;
      },
    },
  });

  return instance;
}

export interface MarkdownResult {
  html: string;
  hadError: boolean;
}

// Repo coordinates for resolving a README's relative links and images. Omit
// every field for a hand-authored page — relative paths are then left as-is.
export interface MarkdownContext {
  owner?: string;
  repo?: string;
  branch?: string;
  repoUrl?: string;
}

export function renderMarkdownToHTML(
  markdown: string,
  ctx: MarkdownContext = {},
): MarkdownResult {
  try {
    const markedInstance = buildMarked(
      ctx.owner ?? "",
      ctx.repo ?? "",
      ctx.branch ?? "",
      ctx.repoUrl ?? "",
    );
    const html = markedInstance.parse(markdown, { async: false }) as string;
    return { html, hadError: false };
  } catch {
    const escaped = markdown
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return { html: `<pre>${escaped}</pre>`, hadError: true };
  }
}
