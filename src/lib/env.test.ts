import { describe, expect, it } from "vitest";
import { readRuntimeEnv, requireEnv, type RuntimeEnv } from "@/lib/env";

const FULL: RuntimeEnv = {
  GITHUB_TOKEN: "gh",
  PUBLIC_GITHUB_USERNAME: "gk",
  LITERAL_EMAIL: "a@b.co",
  LITERAL_PASSWORD: "pw",
  INTERIS_USERNAME: "gk",
  NASA_API_KEY: "",
};

describe("readRuntimeEnv", () => {
  it("trims strings and blanks non-string values", () => {
    const env = readRuntimeEnv({
      GITHUB_TOKEN: "  gh  ",
      PUBLIC_GITHUB_USERNAME: 42,
    });
    expect(env.GITHUB_TOKEN).toBe("gh");
    expect(env.PUBLIC_GITHUB_USERNAME).toBe("");
  });

  it("returns all-blank keys for a non-object source", () => {
    expect(readRuntimeEnv(null)).toEqual({
      GITHUB_TOKEN: "",
      PUBLIC_GITHUB_USERNAME: "",
      LITERAL_EMAIL: "",
      LITERAL_PASSWORD: "",
      INTERIS_USERNAME: "",
      NASA_API_KEY: "",
    });
  });
});

describe("requireEnv", () => {
  it("narrows to exactly the requested keys when all are present", () => {
    const result = requireEnv(FULL, ["GITHUB_TOKEN", "PUBLIC_GITHUB_USERNAME"]);
    expect(result).toEqual({
      ok: true,
      data: { GITHUB_TOKEN: "gh", PUBLIC_GITHUB_USERNAME: "gk" },
    });
  });

  it("lists only the missing bindings, in requested order", () => {
    const result = requireEnv(readRuntimeEnv(null), [
      "PUBLIC_GITHUB_USERNAME",
      "GITHUB_TOKEN",
    ]);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe("MISSING_ENV");
    expect(result.error.fields).toEqual([
      "PUBLIC_GITHUB_USERNAME",
      "GITHUB_TOKEN",
    ]);
    expect(result.error.message).toBe(
      "Missing required environment binding(s): PUBLIC_GITHUB_USERNAME, GITHUB_TOKEN",
    );
  });

  it("ignores present keys the caller did not ask about", () => {
    const result = requireEnv({ ...FULL, NASA_API_KEY: "" }, ["GITHUB_TOKEN"]);
    expect(result.ok).toBe(true);
  });

  it("treats a blank string as missing", () => {
    const result = requireEnv({ ...FULL, GITHUB_TOKEN: "" }, ["GITHUB_TOKEN"]);
    expect(result.ok).toBe(false);
  });
});
