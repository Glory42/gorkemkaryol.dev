import { describe, expect, it } from "vitest";
import { renderMarkdownToHTML } from "@/server/markdown/markdown";

describe("renderMarkdownToHTML", () => {
  it("renders a badge row as anchors wrapping images", () => {
    const md =
      "[![live](https://img.shields.io/badge/live-x.dev-blue)](https://x.dev)";
    const { html, hadError } = renderMarkdownToHTML(md);
    expect(hadError).toBe(false);
    expect(html).toContain('<a href="https://x.dev"');
    expect(html).toContain("<img");
    expect(html).toContain('src="https://img.shields.io/badge/live-x.dev-blue"');
    expect(html).not.toContain("![live]");
  });

  it("gives headings GitHub-style slug ids for in-page TOC links", () => {
    const { html } = renderMarkdownToHTML("## Set Up the Frontend\n\n[go](#set-up-the-frontend)");
    expect(html).toContain('<h2 id="set-up-the-frontend">');
    expect(html).toContain('href="#set-up-the-frontend"');
  });

  it("resolves a relative README image against the raw host when repo context is given", () => {
    const { html } = renderMarkdownToHTML("![diagram](./docs/x.png)", {
      owner: "gk",
      repo: "proj",
      branch: "main",
      repoUrl: "https://github.com/gk/proj",
    });
    expect(html).toContain(
      'src="https://raw.githubusercontent.com/gk/proj/main/docs/x.png"',
    );
  });

  it("leaves a relative link untouched with no repo context", () => {
    const { html } = renderMarkdownToHTML("[x](./docs/x.md)");
    expect(html).toContain('href="./docs/x.md"');
  });

  it("escapes raw HTML blocks in an untrusted README", () => {
    const { html } = renderMarkdownToHTML("<script>alert(1)</script>");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
