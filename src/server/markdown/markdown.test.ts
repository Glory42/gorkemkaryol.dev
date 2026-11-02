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

  const repoCtx = {
    owner: "gk",
    repo: "proj",
    branch: "main",
    repoUrl: "https://github.com/gk/proj",
  };

  it("renders a centred raw-HTML icon with its relative src resolved", () => {
    const md = '<p align="center">\n  <img src="assets/icon.png" alt="" width="112">\n</p>';
    const { html } = renderMarkdownToHTML(md, repoCtx);
    expect(html).toContain('<p align="center">');
    expect(html).toContain(
      '<img src="https://raw.githubusercontent.com/gk/proj/main/assets/icon.png" alt="" width="112" loading="lazy">',
    );
    expect(html).not.toContain("&lt;img");
  });

  it("keeps a raw-HTML screenshot table", () => {
    const md = '<table>\n  <tr>\n    <td align="center"><img src="shots/a.webp"></td>\n  </tr>\n</table>';
    const { html } = renderMarkdownToHTML(md, repoCtx);
    expect(html).toContain('<td align="center"><img src="https://raw.githubusercontent.com/gk/proj/main/shots/a.webp"');
    expect(html).toContain("</table>");
  });

  it("drops scripts, event handlers and javascript: urls from raw HTML", () => {
    const { html } = renderMarkdownToHTML(
      '<script>alert(1)</script>\n\n<img src="x.png" onerror="alert(1)">\n\n<a href="jav&#x61;script:alert(1)">x</a>',
    );
    expect(html).not.toContain("<script");
    expect(html).not.toContain("alert(1)");
    expect(html).not.toContain("onerror");
    expect(html).not.toContain("javascript");
  });

  it("does not link a javascript: markdown url", () => {
    const { html } = renderMarkdownToHTML("[x](javascript:alert(1))");
    expect(html).not.toContain("<a");
    expect(html).toContain("x");
  });

  it("renders a GitHub alert as a titled callout", () => {
    const { html } = renderMarkdownToHTML("> [!NOTE]\n> **Early** days.");
    expect(html).toContain('<div class="readme-alert readme-alert-note">');
    expect(html).toContain('<p class="readme-alert-title">Note</p><p><strong>Early</strong> days.</p>');
    expect(html).not.toContain("[!NOTE]");
  });
});
