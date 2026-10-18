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

  it.each(pages.map((page) => [page.href, page] as const))("renders %s without page-level styling", (_, page) => {
    const html = renderToStaticMarkup(<page.Content components={components} />);
    expect(html.length).toBeGreaterThan(0);
    expect(html).not.toContain("$\\to$");
  });
});
