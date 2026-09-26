import { describe, expect, it } from "vitest";
import { runShellCommand } from "@/features/playground/shell-commands";

describe("runShellCommand", () => {
  it("returns nothing for a blank line", () => {
    expect(runShellCommand("   ")).toEqual({ lines: [] });
  });

  it("lists commands on help", () => {
    expect(runShellCommand("help").lines.length).toBeGreaterThan(0);
  });

  it("prints a known file on cat", () => {
    const result = runShellCommand("cat about.txt");
    expect(result.lines[0].length).toBeGreaterThan(0);
  });

  it("errors on an unknown file", () => {
    expect(runShellCommand("cat nope.txt").lines[0]).toMatch(/no such file/);
  });

  it("navigates on cd to a known section", () => {
    expect(runShellCommand("cd projects").navigateTo).toBe("/projects");
    expect(runShellCommand("cd /").navigateTo).toBe("/");
  });

  it("errors on cd to an unknown section", () => {
    expect(runShellCommand("cd nowhere").navigateTo).toBeUndefined();
  });

  it("signals a clear on clear", () => {
    expect(runShellCommand("clear")).toEqual({ lines: [], clear: true });
  });

  it("signals a navigate on exit", () => {
    expect(runShellCommand("exit").navigateTo).toBe("/playground");
  });

  it("echoes its argument", () => {
    expect(runShellCommand("echo hi there").lines).toEqual(["hi there"]);
  });

  it("falls back to command-not-found", () => {
    expect(runShellCommand("banana").lines[0]).toMatch(/command not found/);
  });

  it("pairs ascii art with system info on fastfetch", () => {
    const result = runShellCommand("fastfetch");
    expect(result.lines.length).toBeGreaterThan(10);
    expect(result.lines.some((l) => l.includes("gorkem@portfolio"))).toBe(true);
    expect(result.lines.some((l) => l.includes("OS:"))).toBe(true);
  });
});
