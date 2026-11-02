import { Marked } from "marked";
import {
  escapeAttr,
  isExternalUrl,
  isSafeUrl,
  sanitizeRawHtml,
} from "@/server/markdown/raw-html";

const ALERT_TITLES: Record<string, string> = {
  NOTE: "Note",
  TIP: "Tip",
  IMPORTANT: "Important",
  WARNING: "Warning",
  CAUTION: "Caution",
};

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
    // No repo context (hand-authored page): nothing to resolve a relative path against.
    if (!owner || !repo) return href;
    const clean = href.replace(/^\.\//, "");
    return isImage ? `${rawBase}/${clean}` : `${blobBase}/${clean}`;
  }

  const instance = new Marked();

  // Stable heading ids so a README's own TOC links can scroll; duplicates get -1, -2.
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
        // Slug the rendered text so `## [Title](url)` still becomes `title`, like GitHub.
        const inner = this.parser.parseInline(tokens);
        const id = escapeAttr(uniqueSlug(inner));
        return `<h${depth} id="${id}">${inner}</h${depth}>\n`;
      },
      html({ text }) {
        return sanitizeRawHtml(text, resolveUrl);
      },
      blockquote({ tokens }) {
        const body = this.parser.parse(tokens);
        // GitHub alerts: `> [!NOTE]` becomes a titled callout instead of a literal tag.
        const alert = body.match(/^<p>\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/);
        if (!alert) return `<blockquote>\n${body}</blockquote>\n`;
        const kind = alert[1];
        const rest = body.slice(alert[0].length);
        const content = rest.startsWith("</p>") ? rest.slice(4) : `<p>${rest}`;
        return `<div class="readme-alert readme-alert-${kind.toLowerCase()}"><p class="readme-alert-title">${ALERT_TITLES[kind]}</p>${content}</div>\n`;
      },
      image({ href, title, text }) {
        if (!isSafeUrl(href ?? "")) return escapeAttr(text ?? "");
        const src = escapeAttr(resolveUrl(href ?? "", true));
        const alt = escapeAttr(text ?? "");
        const titleAttr = title ? ` title="${escapeAttr(title)}"` : "";
        return `<img src="${src}" alt="${alt}"${titleAttr} loading="lazy" />`;
      },
      link({ href, title, tokens }) {
        // Render inner tokens so `[![badge](img)](url)` keeps its image instead of raw markdown.
        const inner = this.parser.parseInline(tokens);
        if (!isSafeUrl(href ?? "")) return inner;
        const resolved = resolveUrl(href ?? "", false);
        const safeHref = escapeAttr(resolved);
        const titleAttr = title ? ` title="${escapeAttr(title)}"` : "";
        const externalAttrs = isExternalUrl(resolved)
          ? ` target="_blank" rel="noopener noreferrer nofollow"`
          : "";
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

// Repo coordinates for resolving relative links; omit for hand-authored pages.
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
