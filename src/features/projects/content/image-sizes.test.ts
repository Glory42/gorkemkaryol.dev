import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PROJECT_IMAGE_SIZES } from "@/features/projects/content/image-sizes";

const PUBLIC = join(__dirname, "../../../../public");
const CONTENT = __dirname;

// Width and height from a WebP header (lossy VP8, lossless VP8L or extended VP8X).
function webpSize(file: string): { width: number; height: number } {
  const b = readFileSync(file);
  const chunk = b.toString("ascii", 12, 16);
  if (chunk === "VP8 ") return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
  if (chunk === "VP8L") {
    const bits = b.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (chunk === "VP8X") return { width: b.readUIntLE(24, 3) + 1, height: b.readUIntLE(27, 3) + 1 };
  throw new Error(`${file} is not a WebP`);
}

const markdownImages = readdirSync(CONTENT)
  .filter((f) => f.endsWith(".md"))
  .flatMap((f) => [...readFileSync(join(CONTENT, f), "utf8").matchAll(/!\[[^\]]*\]\((\/projects\/[^)\s]+)\)/g)])
  .map((m) => m[1]);

describe("PROJECT_IMAGE_SIZES", () => {
  it("has a size for every screenshot the write-ups use", () => {
    expect(markdownImages.length).toBeGreaterThan(0);
    for (const src of markdownImages) expect(PROJECT_IMAGE_SIZES, src).toHaveProperty([src]);
  });

  it("matches each file's real pixel size", () => {
    for (const [src, size] of Object.entries(PROJECT_IMAGE_SIZES)) {
      expect(webpSize(join(PUBLIC, src)), src).toEqual(size);
    }
  });
});
