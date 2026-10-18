import fs from "fs";
import os from "os";
import path from "path";
import { describe, expect, it } from "vitest";
import { check, entries } from "./content";

function tree(files: string[]) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "content-"));
  for (const file of files) {
    if (file.endsWith("/")) fs.mkdirSync(path.join(dir, file), { recursive: true });
    else fs.writeFileSync(path.join(dir, file), "");
  }
  return dir;
}

describe("entries", () => {
  it("lists folders in order", () => {
    expect(entries(tree(["b/", "a/"]))).toEqual(["a", "b"]);
  });

  it("refuses a file it was not told to allow", () => {
    expect(() => entries(tree(["0008-x.mdx"]))).toThrow(/unexpected file/);
  });

  it("accepts a file it was told to allow", () => {
    expect(entries(tree(["track.mdx", "0001-x/"]), (file) => file === "track.mdx")).toEqual(["0001-x"]);
  });
});

describe("check", () => {
  const lesson = { title: "T", summary: "S", number: 1, disclosure: "open" as const, sourceProject: "p" };

  it("accepts a complete lesson", () => {
    expect(check(lesson, "x", "lesson")).toBe(lesson);
  });

  it("refuses a lesson without a number", () => {
    expect(() => check({ ...lesson, number: undefined }, "x", "lesson")).toThrow(/number/);
  });

  it("refuses a disclosure other than open or generic", () => {
    expect(() => check({ ...lesson, disclosure: "private" as never }, "x", "record")).toThrow(/disclosure/);
  });

  it("refuses a missing meta", () => {
    expect(() => check(undefined, "x", "page")).toThrow(/meta/);
  });
});
