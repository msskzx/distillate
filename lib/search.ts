import type { RecordMeta } from "./records";

export type IndexedRecord = Omit<RecordMeta, "topics" | "buildsOn" | "variantOf"> & {
  id: string;
  project: string;
  slug: string;
  href: string;
  url: string;
  topics: string[];
  buildsOn: string[];
  variantOf: string[];
  text: string;
};

export type Query = { q?: string; topic?: string; kind?: string; outcome?: string; project?: string };

export const filterKeys = ["topic", "kind", "outcome", "project"] as const;

const words = (value: string) => value.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];

function weight(record: IndexedRecord, word: string) {
  const has = (value: string) => value.toLowerCase().includes(word);
  if (has(record.problem)) return 3;
  if (has(record.approach) || has(record.conditions) || has(record.title) || record.topics.some(has)) return 2;
  if (has(record.text)) return 1;
  return 0;
}

export function searchRecords(records: IndexedRecord[], query: Query): (IndexedRecord & { score: number })[] {
  const matches = (record: IndexedRecord) =>
    (!query.topic || record.topics.includes(query.topic)) &&
    (!query.kind || record.kind === query.kind) &&
    (!query.outcome || record.outcome === query.outcome) &&
    (!query.project || record.project === query.project);
  const terms = [...new Set(words(query.q ?? ""))];
  return records
    .filter(matches)
    .map((record) => ({ ...record, score: terms.reduce((sum, word) => sum + weight(record, word), 0) }))
    .filter((record) => terms.length === 0 || record.score > 0)
    .sort((a, b) => b.score - a.score || b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
}

export function queryFrom(params: URLSearchParams): Query {
  const query: Query = {};
  for (const key of ["q", ...filterKeys] as const) {
    const value = params.get(key)?.trim();
    if (value) query[key] = value;
  }
  return query;
}

export const marks: Record<string, string> = { solved: "✓", failed: "✗", partial: "◐", open: "○" };
