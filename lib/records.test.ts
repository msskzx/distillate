import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import topicList from "../content/topics.json";
import {
  buildIndex,
  checkLinks,
  checkRecord,
  genericLeaks,
  kinds,
  outcomes,
  plainText,
  readRecordSources,
  siteUrl,
  type RecordMeta,
  type RecordSource,
} from "./records";

const repoRoot = path.resolve(import.meta.dirname, "..");
const recordsRoot = path.join(repoRoot, "content", "records");
const where = "content/records/namaq/0001-example.mdx";

const requiredStringFields = [
  "title",
  "summary",
  "sourceProject",
  "problem",
  "approach",
  "conditions",
  "evidence",
  "implication",
] as const;

function validMeta(): Partial<RecordMeta> {
  return {
    title: "A batch import dropped rows when a column was added",
    summary: "The importer skipped every row written before the column existed.",
    disclosure: "open",
    sourceProject: "namaq",
    kind: "obstacle",
    problem: "An import silently drops rows after a column is added to the source table.",
    approach: "Compared row counts before and after the migration and replayed the import.",
    outcome: "solved",
    conditions: "PostgreSQL table with about two hundred thousand rows.",
    evidence: "Commit 1a2b3c4 and the import log line for batch 7.",
    implication: "none",
    date: "2026-10-18",
    topics: [topicList[0]],
  };
}

function messageOf(run: () => unknown): string | undefined {
  try {
    run();
  } catch (error) {
    return (error as Error).message;
  }
  return undefined;
}

function sourceOf(project: string, slug: string, date: string, extra: Partial<RecordMeta> = {}): RecordSource {
  const meta = { ...validMeta(), date, sourceProject: project, ...extra } as RecordMeta;
  return { id: `${project}/${slug}`, project, slug, meta, body: "Plain body text." };
}

function realSources(): RecordSource[] {
  return readRecordSources(recordsRoot);
}

describe("checkRecord", () => {
  it("returns the meta unchanged when every field is valid", () => {
    const meta = validMeta();
    expect(checkRecord(meta, where)).toEqual(meta);
  });

  it("accepts a record without topics", () => {
    const meta = validMeta();
    delete meta.topics;
    expect(() => checkRecord(meta, where)).not.toThrow();
  });

  it("accepts an empty topics list", () => {
    expect(() => checkRecord({ ...validMeta(), topics: [] }, where)).not.toThrow();
  });

  it("accepts disclosure generic as well as open", () => {
    expect(() => checkRecord({ ...validMeta(), disclosure: "generic" }, where)).not.toThrow();
  });

  it.each(kinds)("accepts the kind %s", (kind) => {
    expect(() => checkRecord({ ...validMeta(), kind }, where)).not.toThrow();
  });

  it.each(outcomes)("accepts the outcome %s", (outcome) => {
    expect(() => checkRecord({ ...validMeta(), outcome }, where)).not.toThrow();
  });

  it.each(topicList)("accepts the topic %s from content/topics.json", (topic) => {
    expect(() => checkRecord({ ...validMeta(), topics: [topic] }, where)).not.toThrow();
  });

  it.each(requiredStringFields)("fails when %s is missing", (field) => {
    const meta = validMeta();
    delete meta[field];
    expect(() => checkRecord(meta, where)).toThrow();
  });

  it.each(requiredStringFields)("fails when %s is an empty string", (field) => {
    expect(() => checkRecord({ ...validMeta(), [field]: "" }, where)).toThrow();
  });

  it.each(requiredStringFields)("fails when %s is whitespace only", (field) => {
    expect(() => checkRecord({ ...validMeta(), [field]: "   \t " }, where)).toThrow();
  });

  it("fails when kind is not one of the allowed kinds", () => {
    expect(() => checkRecord({ ...validMeta(), kind: "setback" as RecordMeta["kind"] }, where)).toThrow();
  });

  it("fails when outcome is not one of the allowed outcomes", () => {
    expect(() => checkRecord({ ...validMeta(), outcome: "abandoned" as RecordMeta["outcome"] }, where)).toThrow();
  });

  it("fails when disclosure is neither open nor generic", () => {
    expect(() => checkRecord({ ...validMeta(), disclosure: "private" as RecordMeta["disclosure"] }, where)).toThrow();
  });

  it("fails when the date is not a real calendar date", () => {
    expect(() => checkRecord({ ...validMeta(), date: "2026-13-45" }, where)).toThrow();
  });

  it("fails when the date is written day first", () => {
    expect(() => checkRecord({ ...validMeta(), date: "18/10/2026" }, where)).toThrow();
  });

  it("fails when a topic is not in content/topics.json", () => {
    expect(() => checkRecord({ ...validMeta(), topics: ["not-a-real-topic"] }, where)).toThrow();
  });

  it("fails when one of several topics is unknown", () => {
    expect(() => checkRecord({ ...validMeta(), topics: [topicList[0], "not-a-real-topic"] }, where)).toThrow();
  });

  it("fails when the meta is undefined", () => {
    expect(() => checkRecord(undefined, where)).toThrow();
  });

  it("prefixes the error message with the where argument", () => {
    const message = messageOf(() => checkRecord({ ...validMeta(), kind: "setback" as RecordMeta["kind"] }, where));
    expect(message).toBeDefined();
    expect(message!.startsWith(where)).toBe(true);
  });

  it("prefixes the error message with the where argument when meta is undefined", () => {
    const message = messageOf(() => checkRecord(undefined, where));
    expect(message).toBeDefined();
    expect(message!.startsWith(where)).toBe(true);
  });
});

describe("checkLinks", () => {
  it("passes when there are no records", () => {
    expect(() => checkLinks([])).not.toThrow();
  });

  it("passes when no record has buildsOn or variantOf", () => {
    expect(() =>
      checkLinks([
        { id: "namaq/0001-a", meta: {} },
        { id: "distillate/0001-b", meta: {} },
      ]),
    ).not.toThrow();
  });

  it("passes when every buildsOn entry names a record in the list", () => {
    expect(() =>
      checkLinks([
        { id: "namaq/0001-a", meta: {} },
        { id: "namaq/0002-b", meta: { buildsOn: ["namaq/0001-a"] } },
      ]),
    ).not.toThrow();
  });

  it("passes when every variantOf entry names a record in the list", () => {
    expect(() =>
      checkLinks([
        { id: "namaq/0001-a", meta: {} },
        { id: "distillate/0001-b", meta: { variantOf: ["namaq/0001-a"] } },
      ]),
    ).not.toThrow();
  });

  it("fails when a buildsOn entry does not name a record", () => {
    expect(() =>
      checkLinks([{ id: "namaq/0002-b", meta: { buildsOn: ["namaq/0009-missing"] } }]),
    ).toThrow();
  });

  it("fails when a variantOf entry does not name a record", () => {
    expect(() =>
      checkLinks([{ id: "namaq/0002-b", meta: { variantOf: ["namaq/0009-missing"] } }]),
    ).toThrow();
  });

  it("fails when a link names the record itself by a different spelling", () => {
    expect(() =>
      checkLinks([{ id: "namaq/0002-b", meta: { buildsOn: ["namaq/0002-B"] } }]),
    ).toThrow();
  });
});

describe("readRecordSources", () => {
  it("does not throw on the real repository", () => {
    expect(() => readRecordSources()).not.toThrow();
  });

  it("returns one source for every content/records/<project>/*.mdx file", () => {
    const expected = fs
      .readdirSync(recordsRoot)
      .filter((project) => !project.startsWith("."))
      .flatMap((project) =>
        fs
          .readdirSync(path.join(recordsRoot, project))
          .filter((file) => file.endsWith(".mdx"))
          .map((file) => `${project}/${file.replace(/\.mdx$/, "")}`),
      )
      .sort();
    expect(expected.length).toBeGreaterThan(0);
    expect(realSources().map((source) => source.id).sort()).toEqual(expected);
  });

  it("gives each source an id of project/slug with matching project and slug fields", () => {
    for (const source of realSources()) {
      expect(source.id).toBe(`${source.project}/${source.slug}`);
      expect(fs.existsSync(path.join(recordsRoot, source.project, `${source.slug}.mdx`))).toBe(true);
    }
  });

  it("gives each source a string body", () => {
    for (const source of realSources()) {
      expect(typeof source.body).toBe("string");
    }
  });

  it("returns a meta that satisfies checkRecord for every source", () => {
    for (const source of realSources()) {
      expect(() => checkRecord(source.meta, source.id)).not.toThrow();
    }
  });
});

describe("plainText", () => {
  it("turns a RepoLink into its path", () => {
    expect(plainText('<RepoLink repo="x" path="src/a.ts" />')).toBe("src/a.ts");
  });

  it("keeps the path of a RepoLink in place within the surrounding words", () => {
    expect(plainText('See <RepoLink repo="x" path="src/a.ts" /> for the fix.')).toBe("See src/a.ts for the fix.");
  });

  it("removes other tags and keeps their text", () => {
    expect(plainText("<Note>Careful</Note> with the import")).toBe("Careful with the import");
  });

  it("removes tags that carry attributes", () => {
    expect(plainText('<Callout tone="warn">Check the log</Callout>')).toBe("Check the log");
  });

  it("keeps underscores in words", () => {
    expect(plainText("node_modules was left alone")).toBe("node_modules was left alone");
  });

  it("collapses runs of whitespace, including newlines and tabs, to single spaces", () => {
    expect(plainText("first line\n\n   second\tline")).toBe("first line second line");
  });
});

describe("buildIndex", () => {
  it("returns a JSON string ending in a newline whose only key is records", () => {
    const output = buildIndex([sourceOf("namaq", "0001-a", "2026-01-01")]);
    expect(output.endsWith("\n")).toBe(true);
    expect(Object.keys(JSON.parse(output))).toEqual(["records"]);
  });

  it("orders records newest date first", () => {
    const output = JSON.parse(
      buildIndex([
        sourceOf("namaq", "0001-old", "2026-01-05"),
        sourceOf("namaq", "0002-new", "2026-03-09"),
        sourceOf("namaq", "0003-middle", "2026-02-14"),
      ]),
    ) as { records: { id: string }[] };
    expect(output.records.map((record) => record.id)).toEqual([
      "namaq/0002-new",
      "namaq/0003-middle",
      "namaq/0001-old",
    ]);
  });

  it("gives every indexed record an href of /records/<project>/<slug>", () => {
    const output = JSON.parse(buildIndex([sourceOf("namaq", "0001-a", "2026-01-01")])) as {
      records: { href: string; project: string; slug: string }[];
    };
    const [record] = output.records;
    expect(record.href).toBe(`/records/${record.project}/${record.slug}`);
  });

  it("gives every indexed record a url that starts with siteUrl and ends with its href", () => {
    const output = JSON.parse(buildIndex(realSources())) as { records: { url: string; href: string }[] };
    expect(output.records.length).toBeGreaterThan(0);
    for (const record of output.records) {
      expect(record.url.startsWith(siteUrl)).toBe(true);
      expect(record.url.endsWith(record.href)).toBe(true);
    }
  });

  it("gives topics, buildsOn and variantOf as arrays even when the meta omits them", () => {
    const meta = validMeta();
    delete meta.topics;
    const source: RecordSource = {
      id: "namaq/0001-a",
      project: "namaq",
      slug: "0001-a",
      meta: meta as RecordMeta,
      body: "Plain body text.",
    };
    const output = JSON.parse(buildIndex([source])) as {
      records: { topics: unknown; buildsOn: unknown; variantOf: unknown }[];
    };
    const [record] = output.records;
    expect(Array.isArray(record.topics)).toBe(true);
    expect(Array.isArray(record.buildsOn)).toBe(true);
    expect(Array.isArray(record.variantOf)).toBe(true);
  });

  it("keeps the topics, buildsOn and variantOf values it was given", () => {
    const output = JSON.parse(
      buildIndex([
        sourceOf("namaq", "0002-b", "2026-02-01", { buildsOn: ["namaq/0001-a"], variantOf: ["distillate/0001-c"] }),
      ]),
    ) as { records: { buildsOn: string[]; variantOf: string[]; topics: string[] }[] };
    const [record] = output.records;
    expect(record.buildsOn).toEqual(["namaq/0001-a"]);
    expect(record.variantOf).toEqual(["distillate/0001-c"]);
    expect(record.topics).toEqual([topicList[0]]);
  });

  it("fails the staleness check when records.json differs from what the records would index to", () => {
    const committed = fs.readFileSync(path.join(repoRoot, "records.json"), "utf8");
    expect(
      committed,
      "records.json is stale: run `bun run records:index` and commit the result",
    ).toBe(buildIndex(readRecordSources(recordsRoot)));
  });
});

describe("genericLeaks", () => {
  it("returns an empty list for clean prose", () => {
    expect(genericLeaks("a batch import dropped rows when a column was added")).toEqual([]);
  });

  it("returns an empty list for an empty string", () => {
    expect(genericLeaks("")).toEqual([]);
  });

  it("reports a RepoLink", () => {
    expect(genericLeaks('See <RepoLink repo="x" path="notes" /> for detail.').length).toBeGreaterThan(0);
  });

  it.each([
    "https://github.com/owner/repo/pull/12",
    "see gitlab.com/group/project for the thread",
    "bitbucket.org/team/service/commits",
  ])("reports a repository URL in %s", (text) => {
    expect(genericLeaks(text).length).toBeGreaterThan(0);
  });

  it.each(["src/lib/x.ts", "docs/plan.md"])("reports the file path %s", (text) => {
    expect(genericLeaks(`The fix lives in ${text}.`).length).toBeGreaterThan(0);
  });

  it("names a different kind of leak for a RepoLink, a repository URL and a file path", () => {
    const repoLink = genericLeaks('<RepoLink repo="x" path="notes" />');
    const repoUrl = genericLeaks("https://github.com/owner/repo");
    const filePath = genericLeaks("src/lib/x.ts");
    expect(repoLink.length).toBeGreaterThan(0);
    expect(repoUrl.length).toBeGreaterThan(0);
    expect(filePath.length).toBeGreaterThan(0);
    expect(new Set([repoLink[0], repoUrl[0], filePath[0]]).size).toBe(3);
  });

  it("reports every kind of leak present in one text", () => {
    const leaks = genericLeaks('<RepoLink repo="x" path="notes" /> at https://github.com/owner/repo, see src/lib/x.ts');
    expect(leaks.length).toBe(3);
  });

  it("returns no leaks for every real record marked generic", () => {
    const generic = realSources().filter((source) => source.meta.disclosure === "generic");
    for (const source of generic) {
      const text = [source.body, ...Object.values(source.meta).filter((value): value is string => typeof value === "string")].join("\n");
      expect(genericLeaks(text), source.id).toEqual([]);
    }
  });
});
