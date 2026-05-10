import { Marked } from "marked";

function escapeAttr(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
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
      href.startsWith("#")
    ) {
      return href;
    }
    const clean = href.replace(/^\.\//, "");
    return isImage ? `${rawBase}/${clean}` : `${blobBase}/${clean}`;
  }

  const instance = new Marked();

  instance.use({
    renderer: {
      image({ href, title, text }) {
        const src = escapeAttr(resolveUrl(href ?? "", true));
        const alt = escapeAttr(text ?? "");
        const titleAttr = title ? ` title="${escapeAttr(title)}"` : "";
        return `<img src="${src}" alt="${alt}"${titleAttr} loading="lazy" />`;
      },
      link({ href, title, text }) {
        const resolved = resolveUrl(href ?? "", false);
        const isExternal =
          resolved.startsWith("http://") || resolved.startsWith("https://");
        const safeHref = escapeAttr(resolved);
        const titleAttr = title ? ` title="${escapeAttr(title)}"` : "";
        const externalAttrs = isExternal
          ? ` target="_blank" rel="noopener noreferrer nofollow"`
          : "";
        return `<a href="${safeHref}"${titleAttr}${externalAttrs}>${text}</a>`;
      },
    },
  });

  return instance;
}

export interface MarkdownResult {
  html: string;
  hadError: boolean;
}

export function renderMarkdownToHTML(
  markdown: string,
  owner: string,
  repo: string,
  branch: string,
  repoUrl: string,
): MarkdownResult {
  try {
    const markedInstance = buildMarked(owner, repo, branch, repoUrl);
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
