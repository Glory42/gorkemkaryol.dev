import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import type { Element, Root } from "hast";

interface RenderReadmeOptions {
  owner: string;
  repo: string;
  branch: string;
}

interface RenderReadmeResult {
  html: string;
  hadError: boolean;
}

const PROTOCOL_PATTERN = /^[a-zA-Z][a-zA-Z\d+.-]*:/;

function isAbsoluteUrl(value: string): boolean {
  return PROTOCOL_PATTERN.test(value) || value.startsWith("//");
}

function isSafeSpecialLink(value: string): boolean {
  return (
    value.startsWith("#") ||
    value.startsWith("mailto:") ||
    value.startsWith("tel:")
  );
}

function buildRawUrl(
  owner: string,
  repo: string,
  branch: string,
  relativePath: string,
): string {
  const parsed = new URL(relativePath, "https://repo.local/");
  const normalizedPath = parsed.pathname.replace(/^\/+/, "");
  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${normalizedPath}${parsed.search}${parsed.hash}`;
}

function buildBlobUrl(
  owner: string,
  repo: string,
  branch: string,
  relativePath: string,
): string {
  const parsed = new URL(relativePath, "https://repo.local/");
  const normalizedPath = parsed.pathname.replace(/^\/+/, "");
  return `https://github.com/${owner}/${repo}/blob/${branch}/${normalizedPath}${parsed.search}${parsed.hash}`;
}

function rewriteLinksPlugin({ owner, repo, branch }: RenderReadmeOptions) {
  return () => {
    return (tree: Root) => {
      visit(tree, "element", (node: Element) => {
        if (node.tagName === "img") {
          const src = node.properties?.src;
          if (
            typeof src === "string" &&
            !isAbsoluteUrl(src) &&
            !src.startsWith("data:")
          ) {
            node.properties.src = buildRawUrl(owner, repo, branch, src);
          }
          node.properties.loading = "lazy";
          return;
        }

        if (node.tagName !== "a") return;

        const href = node.properties?.href;
        if (typeof href !== "string" || href.length === 0) return;

        if (isSafeSpecialLink(href)) return;

        if (isAbsoluteUrl(href)) {
          if (href.startsWith("http://") || href.startsWith("https://")) {
            node.properties.target = "_blank";
            node.properties.rel = "noopener noreferrer nofollow";
          }
          return;
        }

        node.properties.href = buildBlobUrl(owner, repo, branch, href);
        node.properties.target = "_blank";
        node.properties.rel = "noopener noreferrer nofollow";
      });
    };
  };
}

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    "details",
    "summary",
    "kbd",
    "mark",
    "s",
  ],
  attributes: {
    ...defaultSchema.attributes,
    "*": [
      ...(defaultSchema.attributes?.["*"] ?? []),
      "className",
      "id",
      "title",
    ],
    a: [...(defaultSchema.attributes?.a ?? []), "target", "rel", "name"],
    code: [
      ...(defaultSchema.attributes?.code ?? []),
      ["className", /^language-/, /^hljs/],
    ],
    span: [...(defaultSchema.attributes?.span ?? []), ["className", /^hljs/]],
    pre: [...(defaultSchema.attributes?.pre ?? []), ["className", /^hljs/]],
    img: [...(defaultSchema.attributes?.img ?? []), "loading"],
  },
} as typeof defaultSchema;

export async function renderReadmeToHtml(
  markdown: string,
  options: RenderReadmeOptions,
): Promise<RenderReadmeResult> {
  try {
    const file = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw)
      .use(rewriteLinksPlugin(options))
      .use(rehypeHighlight)
      .use(rehypeSanitize as never, sanitizeSchema)
      .use(rehypeStringify)
      .process(markdown);

    return {
      html: String(file),
      hadError: false,
    };
  } catch (error) {
    console.error("README markdown rendering failed:", error);
    return {
      html: `<pre>${escapeHtml(markdown)}</pre>`,
      hadError: true,
    };
  }
}
