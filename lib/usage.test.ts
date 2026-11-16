import { describe, expect, it } from "vitest";
import { readRecordSources, type RecordMeta, type RecordSource } from "./records";
import { hasTried, readUsage, recordStats, stats, type Usage, type UsagePr } from "./usage";

const source = (id: string, date: string, body = ""): RecordSource => {
  const [project, slug] = id.split("/");
  return { id, project, slug, body, meta: { title: id, date } as RecordMeta };
};
const pr = (number: number, mergedAt: string, used: string[], unresolved: UsagePr["unresolved"] = []): UsagePr => ({
  number,
  title: `PR ${number}`,
  mergedAt,
  line: used.join(", ") || "none",
  used,
  unresolved,
});

const sources = [
  source("namaq/0001-a", "2026-10-02", "Text.\n\n## Tried\n\n- one → no"),
  source("namaq/0002-b", "2026-11-01"),
  source("distillate/0005-c", "2026-11-03"),
];
const usage: Usage[] = [
  {
    project: "namaq",
    repo: "msskzx/namaq",
    records: { "namaq/0001-a": { file: "docs/records/0001-a.md", createdIn: 7 } },
    prs: [
      pr(12, "2026-11-05", ["namaq/0001-a"]),
      pr(10, "2026-10-20", ["namaq/0001-a", "distillate/0005-c"]),
      pr(11, "2026-11-04", [], [{ text: "0031", reason: "2 records share the number 0031" }]),
      pr(13, "2026-11-06", ["namaq/0099-gone"]),
    ],
  },
];

describe("stats", () => {
  const s = stats(sources, usage);

  it("counts records, uses and PRs from the usage lines", () => {
    expect([s.total, s.withTried, s.prs, s.prsUsing, s.uses]).toEqual([3, 1, 4, 2, 3]);
    expect(s.byProject).toEqual([
      { project: "namaq", count: 2 },
      { project: "distillate", count: 1 },
    ]);
    expect(s.mostUsed.map((each) => [each.source.id, each.uses.map((use) => use.pr.number)])).toEqual([
      ["namaq/0001-a", [10, 12]],
      ["distillate/0005-c", [10]],
    ]);
    expect(s.neverUsed.map((each) => each.id)).toEqual(["namaq/0002-b"]);
  });

  it("adds records by their date and uses by the merge month", () => {
    expect(s.byMonth).toEqual([
      { month: "2026-10", added: 1, total: 1, prs: 1, prsUsing: 1, uses: 2 },
      { month: "2026-11", added: 2, total: 3, prs: 3, prsUsing: 1, uses: 1 },
    ]);
  });

  it("lists names it could not count instead of counting them", () => {
    expect(s.unresolved.map((each) => [each.pr.number, each.text, each.reason])).toEqual([
      [11, "0031", "2 records share the number 0031"],
      [13, "namaq/0099-gone", "not a record here"],
    ]);
  });
});

describe("recordStats", () => {
  it("gives a record its uses in merge order, its file, the PR that added it and its Tried list", () => {
    const one = recordStats("namaq/0001-a", sources[0].body, usage);
    expect([one.uses.length, one.first?.pr.number, one.last?.pr.number, one.tried]).toEqual([2, 10, 12, true]);
    expect(one.source).toEqual({ repo: "msskzx/namaq", file: "docs/records/0001-a.md", createdIn: 7 });
    const none = recordStats("namaq/0002-b", "", usage);
    expect([none.uses.length, none.first, none.source, none.tried]).toEqual([0, undefined, undefined, false]);
  });

  it("finds a Tried section only as a heading", () => {
    expect(hasTried("## Tried\n- x")).toBe(true);
    expect(hasTried("We tried a lot.")).toBe(false);
  });
});

describe("content/usage", () => {
  it("names only records this site holds, each with its file", () => {
    const ids = new Set(readRecordSources().map((each) => each.id));
    const usage = readUsage();
    expect(usage.length).toBeGreaterThan(0);
    for (const file of usage) {
      expect(file.repo).toMatch(/^msskzx\/[\w-]+$/);
      for (const [id, record] of Object.entries(file.records)) {
        expect(ids.has(id), id).toBe(true);
        expect(record.file).toMatch(/\.md$/);
      }
      for (const each of file.prs) expect(each.mergedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
