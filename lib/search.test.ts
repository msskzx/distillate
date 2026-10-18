import { describe, expect, it } from "vitest";
import index from "@/records.json";
import { queryFrom, searchRecords, type IndexedRecord } from "./search";

const indexed = index.records as IndexedRecord[];

const base: Omit<IndexedRecord, "id"> = {
  project: "alpha",
  slug: "",
  href: "",
  url: "",
  title: "",
  summary: "",
  disclosure: "open",
  sourceProject: "alpha",
  kind: "obstacle",
  problem: "",
  approach: "",
  outcome: "solved",
  conditions: "",
  evidence: "",
  implication: "",
  date: "2026-01-01",
  topics: [],
  buildsOn: [],
  variantOf: [],
  text: "",
};

function record(id: string, fields: Partial<Omit<IndexedRecord, "id">> = {}): IndexedRecord {
  return { ...base, id, slug: id, ...fields };
}

const highlightFixture = [
  record("x/one", { date: "2026-03-01", problem: "Highlight drifts on resize", topics: ["ui"], project: "alpha" }),
  record("x/two", { date: "2026-02-01", approach: "Highlight the row", topics: ["ui"], kind: "detour", outcome: "open", project: "beta" }),
  record("x/three", { date: "2026-04-01", text: "a highlight note", topics: ["data"], project: "alpha" }),
  record("x/four", { date: "2026-01-01", title: "Highlight title", topics: ["ui", "data"], kind: "challenge", project: "beta" }),
];

const ids = (records: { id: string }[]) => records.map((item) => item.id);

describe("searchRecords with an empty query", () => {
  it("returns every record with score 0, newest date first", () => {
    const result = searchRecords(highlightFixture, {});
    expect(ids(result)).toEqual(["x/three", "x/one", "x/two", "x/four"]);
    expect(result.every((item) => item.score === 0)).toBe(true);
  });

  it("treats an empty q string as no query", () => {
    expect(ids(searchRecords(highlightFixture, { q: "" }))).toEqual(["x/three", "x/one", "x/two", "x/four"]);
  });

  it("treats a q with no letters or digits as no query", () => {
    const result = searchRecords(highlightFixture, { q: " -- !! " });
    expect(result).toHaveLength(4);
    expect(result.every((item) => item.score === 0)).toBe(true);
  });

  it("orders records with the same date by id ascending", () => {
    const records = [
      record("x/b", { date: "2026-01-01" }),
      record("x/a", { date: "2026-01-01" }),
      record("x/c", { date: "2026-01-02" }),
    ];
    expect(ids(searchRecords(records, {}))).toEqual(["x/c", "x/a", "x/b"]);
  });

  it("returns an empty list for an empty input", () => {
    expect(searchRecords([], {})).toEqual([]);
  });
});

describe("searchRecords word scoring", () => {
  it("scores a word in problem as 3", () => {
    const [only] = searchRecords([record("x/p", { problem: "alpha" })], { q: "alpha" });
    expect(only.score).toBe(3);
  });

  it("scores a word in approach, conditions, title or a topic as 2", () => {
    const records = [
      record("x/approach", { approach: "alpha" }),
      record("x/conditions", { conditions: "alpha" }),
      record("x/title", { title: "alpha" }),
      record("x/topic", { topics: ["alpha"] }),
    ];
    const result = searchRecords(records, { q: "alpha" });
    expect(result.map((item) => item.score)).toEqual([2, 2, 2, 2]);
  });

  it("scores a word only in text as 1", () => {
    const [only] = searchRecords([record("x/t", { text: "alpha" })], { q: "alpha" });
    expect(only.score).toBe(1);
  });

  it("counts the best place a word appears once, not every place", () => {
    const [only] = searchRecords([record("x/both", { problem: "alpha", text: "alpha", title: "alpha" })], { q: "alpha" });
    expect(only.score).toBe(3);
  });

  it("sums the best score of each query word", () => {
    const records = [
      record("x/sum", { problem: "alpha", text: "beta" }),
      record("x/both-in-problem", { problem: "alpha beta" }),
    ];
    const result = searchRecords(records, { q: "alpha beta" });
    expect(result.map((item) => [item.id, item.score])).toEqual([
      ["x/both-in-problem", 6],
      ["x/sum", 4],
    ]);
  });

  it("counts a repeated query word once", () => {
    const [once] = searchRecords([record("x/r", { problem: "alpha" })], { q: "alpha" });
    const [twice] = searchRecords([record("x/r", { problem: "alpha" })], { q: "alpha alpha" });
    expect(twice.score).toBe(once.score);
    expect(twice.score).toBe(3);
  });

  it("matches a word case-insensitively", () => {
    const [upper] = searchRecords([record("x/u", { problem: "ALPHA" })], { q: "alpha" });
    const [query] = searchRecords([record("x/l", { problem: "alpha" })], { q: "ALPHA" });
    expect(upper.score).toBe(3);
    expect(query.score).toBe(3);
  });

  it("matches a word as a substring of a longer word", () => {
    const [only] = searchRecords([record("x/s", { problem: "alpha" })], { q: "pha" });
    expect(only.score).toBe(3);
  });

  it("splits q on punctuation and whitespace into separate words", () => {
    const records = [record("x/split", { problem: "alpha beta" })];
    expect(searchRecords(records, { q: "alpha, beta!" })[0].score).toBe(6);
    expect(searchRecords(records, { q: "alpha-beta" })[0].score).toBe(6);
  });

  it("matches words in a non-Latin script", () => {
    const records = [record("x/ar", { problem: "الخلافة الراشدة" })];
    expect(searchRecords(records, { q: "الخلافة" })[0].score).toBe(3);
  });

  it("returns a numeric score on every result", () => {
    const result = searchRecords(highlightFixture, { q: "highlight" });
    expect(result.every((item) => typeof item.score === "number")).toBe(true);
  });
});

describe("searchRecords matching and ordering with a query", () => {
  it("leaves out records that score 0 for the query", () => {
    const records = [record("x/hit", { problem: "alpha" }), record("x/miss", { problem: "gamma" })];
    expect(ids(searchRecords(records, { q: "alpha" }))).toEqual(["x/hit"]);
  });

  it("orders by score, highest first, ahead of newer dates", () => {
    const result = searchRecords(highlightFixture, { q: "highlight" });
    expect(ids(result)).toEqual(["x/one", "x/two", "x/four", "x/three"]);
    expect(result.map((item) => item.score)).toEqual([3, 2, 2, 1]);
  });

  it("breaks score ties by newest date first", () => {
    const records = [
      record("x/old", { date: "2026-01-01", problem: "gamma" }),
      record("x/new", { date: "2026-02-01", problem: "gamma" }),
    ];
    expect(ids(searchRecords(records, { q: "gamma" }))).toEqual(["x/new", "x/old"]);
  });

  it("breaks score and date ties by id ascending", () => {
    const records = [
      record("x/b", { date: "2026-01-01", problem: "gamma" }),
      record("x/a", { date: "2026-01-01", problem: "gamma" }),
    ];
    expect(ids(searchRecords(records, { q: "gamma" }))).toEqual(["x/a", "x/b"]);
  });
});

describe("searchRecords filters", () => {
  it("keeps only records whose topics include the topic exactly", () => {
    expect(ids(searchRecords(highlightFixture, { topic: "ui" }))).toEqual(["x/one", "x/two", "x/four"]);
    expect(searchRecords(highlightFixture, { topic: "u" })).toEqual([]);
  });

  it("keeps only records of the given kind", () => {
    expect(ids(searchRecords(highlightFixture, { kind: "detour" }))).toEqual(["x/two"]);
  });

  it("keeps only records with the given outcome", () => {
    expect(ids(searchRecords(highlightFixture, { outcome: "open" }))).toEqual(["x/two"]);
  });

  it("keeps only records of the given project", () => {
    expect(ids(searchRecords(highlightFixture, { project: "beta" }))).toEqual(["x/two", "x/four"]);
  });

  it("returns only records that match every filter given", () => {
    expect(ids(searchRecords(highlightFixture, { project: "alpha", kind: "obstacle" }))).toEqual(["x/three", "x/one"]);
    expect(ids(searchRecords(highlightFixture, { topic: "ui", outcome: "open" }))).toEqual(["x/two"]);
    expect(searchRecords(highlightFixture, { topic: "ui", kind: "challenge", project: "alpha" })).toEqual([]);
  });

  it("applies filters together with the query", () => {
    expect(ids(searchRecords(highlightFixture, { q: "highlight", project: "beta" }))).toEqual(["x/two", "x/four"]);
  });

  it("returns an empty list for an unknown filter value rather than an error", () => {
    expect(searchRecords(highlightFixture, { topic: "nonexistent" })).toEqual([]);
    expect(searchRecords(highlightFixture, { kind: "nope" })).toEqual([]);
    expect(searchRecords(highlightFixture, { outcome: "nope" })).toEqual([]);
    expect(searchRecords(highlightFixture, { project: "nope" })).toEqual([]);
  });
});

describe("queryFrom", () => {
  it("keeps every known key that is present and non-empty", () => {
    const params = new URLSearchParams("q=highlight&topic=ui&kind=detour&outcome=open&project=namaq");
    expect(queryFrom(params)).toStrictEqual({
      q: "highlight",
      topic: "ui",
      kind: "detour",
      outcome: "open",
      project: "namaq",
    });
  });

  it("drops keys whose value is empty or only whitespace", () => {
    const params = new URLSearchParams("q=+++&topic=&kind=%20&outcome=open");
    expect(queryFrom(params)).toStrictEqual({ outcome: "open" });
  });

  it("drops keys outside q, topic, kind, outcome and project", () => {
    const params = new URLSearchParams("sort=date&page=2&project=namaq");
    expect(queryFrom(params)).toStrictEqual({ project: "namaq" });
  });

  it("returns an empty query for empty params", () => {
    expect(queryFrom(new URLSearchParams(""))).toStrictEqual({});
  });
});

describe("searchRecords against the real index", () => {
  it("ranks the fixing-the-example record first for the highlight query", () => {
    expect(searchRecords(indexed, { q: "highlight" })[0].id).toBe(
      "namaq/0019-fixing-the-example-broke-the-ayah-next-door",
    );
  });

  it("returns every indexed record for an empty query", () => {
    expect(searchRecords(indexed, {})).toHaveLength(indexed.length);
  });
});
