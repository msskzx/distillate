import fs from "fs";
import mermaid from "mermaid";
import path from "path";
import { describe, expect, it } from "vitest";

const files = fs
  .readdirSync("content", { recursive: true, encoding: "utf8" })
  .filter((file) => file.endsWith(".mdx"))
  .map((file) => path.join("content", file));

const charts = files.flatMap((file) =>
  [...fs.readFileSync(file, "utf8").matchAll(/<Mermaid[\s\S]*?chart=\{`([\s\S]*?)`\}/g)].map(
    (match, i) => [`${file} #${i + 1}`, match[1]] as const,
  ),
);

describe("Mermaid charts in content", () => {
  it("finds the charts", () => {
    expect(charts.length).toBeGreaterThan(0);
  });

  it("rejects a broken chart", async () => {
    await expect(mermaid.parse("graph TD\n  A -->")).rejects.toThrow();
  });

  it.each(charts)("parses %s", async (_, chart) => {
    await expect(mermaid.parse(chart)).resolves.toBeTruthy();
  });
});
