import fs from "fs";
import path from "path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { components } from "@/mdx-components";
import { records, tracks } from "./content";

const all = await tracks();
const allRecords = await records();
const pages = [
  ...all.flatMap((track) => [track, ...track.lessons, ...track.pages]),
  ...allRecords,
];

describe("content", () => {
  it("numbers each track's lessons from 1 with no gaps", () => {
    for (const track of all) {
      expect(track.lessons.map((lesson) => lesson.meta.number)).toEqual(track.lessons.map((_, i) => i + 1));
    }
  });

  it("links every record's lesson to a lesson that exists", () => {
    const lessons = new Set(all.flatMap((track) => track.lessons.map((lesson) => `${track.slug}/${lesson.slug}`)));
    for (const record of allRecords) {
      if (record.meta.lesson) expect(lessons, record.href).toContain(record.meta.lesson);
    }
  });

  it("keeps styling out of every MDX file", () => {
    const files = fs.readdirSync("content", { recursive: true, encoding: "utf8" }).filter((file) => file.endsWith(".mdx"));
    for (const file of files) {
      expect(fs.readFileSync(path.join("content", file), "utf8"), file).not.toMatch(/\b(class|className|style)=/);
    }
  });

  it("renders Markdown tables as tables", () => {
    const html = pages.map((page) => renderToStaticMarkup(<page.Content components={components} />)).join("");
    expect(html).toContain("<table>");
  });

  it.each(pages.map((page) => [page.href, page] as const))("renders %s", (_, page) => {
    const html = renderToStaticMarkup(<page.Content components={components} />);
    expect(html.length).toBeGreaterThan(0);
    expect(html).not.toContain("$\\to$");
  });
});
