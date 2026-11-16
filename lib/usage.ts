import fs from "fs";
import path from "path";
import type { RecordSource } from "./records";

// content/usage/<project>.json is written by the source project's export
// (namaq: `npm run records:export`). It holds each merged PR's "Records used:"
// line, the records that line resolves to, and the PR that added each record
// file. Every number on the stats pages is counted from it here, at build time.

export type UsagePr = {
  number: number;
  title: string;
  mergedAt: string;
  line: string;
  used: string[];
  unresolved: { text: string; reason: string }[];
};

export type Usage = {
  project: string;
  repo: string;
  records: Record<string, { file: string; createdIn: number | null }>;
  prs: UsagePr[];
};

export type Use = { project: string; repo: string; pr: UsagePr };

export type RecordStats = {
  uses: Use[];
  first?: Use;
  last?: Use;
  source?: { repo: string; file: string; createdIn: number | null };
  tried: boolean;
};

export type MonthRow = { month: string; added: number; total: number; prs: number; prsUsing: number; uses: number };

export function readUsage(root = path.join(process.cwd(), "content", "usage")): Usage[] {
  if (!fs.existsSync(root)) return [];
  return fs
    .readdirSync(root)
    .filter((name) => name.endsWith(".json"))
    .sort()
    .map((name) => ({ project: name.replace(/\.json$/, ""), ...JSON.parse(fs.readFileSync(path.join(root, name), "utf8")) }));
}

export const hasTried = (body: string) => /^## Tried\b/m.test(body);

export const prUrl = (repo: string, number: number) => `https://github.com/${repo}/pull/${number}`;

export const fileUrl = (repo: string, file: string) => `https://github.com/${repo}/blob/main/${file}`;

const byMerge = (a: Use, b: Use) => a.pr.mergedAt.localeCompare(b.pr.mergedAt) || a.pr.number - b.pr.number;

export function usesOf(usage: Usage[]) {
  const uses = new Map<string, Use[]>();
  for (const { project, repo, prs } of usage) {
    for (const pr of prs) for (const id of pr.used) uses.set(id, [...(uses.get(id) ?? []), { project, repo, pr }]);
  }
  for (const list of uses.values()) list.sort(byMerge);
  return uses;
}

export function recordStats(id: string, body: string, usage: Usage[]): RecordStats & { tracked: boolean } {
  const uses = usesOf(usage).get(id) ?? [];
  const holder = usage.find((each) => id in each.records);
  return {
    uses,
    first: uses[0],
    last: uses.at(-1),
    source: holder && { repo: holder.repo, ...holder.records[id] },
    tried: hasTried(body),
    tracked: usage.some((each) => each.project === id.split("/")[0]),
  };
}

export function stats(sources: RecordSource[], usage: Usage[]) {
  const ids = new Set(sources.map((source) => source.id));
  const uses = usesOf(usage);
  const prs = usage.flatMap(({ project, repo, prs }) => prs.map((pr) => ({ project, repo, pr })));

  // A PR may name a record this site does not hold (a typo, a renamed file);
  // it is listed with the lines that could not be read, not counted.
  const unresolved = prs.flatMap(({ repo, pr }) => [
    ...pr.unresolved.map((each) => ({ repo, pr, ...each })),
    ...pr.used.filter((id) => !ids.has(id)).map((id) => ({ repo, pr, text: id, reason: "not a record here" })),
  ]);

  // "Never used" means only records whose project's PRs are read: a project
  // with no usage file has no PRs counted, so its records are untracked.
  const tracked = new Set(usage.map((each) => each.project));
  const counted = sources.map((source) => ({ source, uses: uses.get(source.id) ?? [] }));
  const mostUsed = counted.filter((each) => each.uses.length).sort((a, b) => b.uses.length - a.uses.length || a.source.id.localeCompare(b.source.id));
  const neverUsed = counted.filter((each) => !each.uses.length && tracked.has(each.source.project)).map((each) => each.source);
  const untracked = [...new Set(sources.map((source) => source.project))].filter((project) => !tracked.has(project));

  const months = new Map<string, MonthRow>();
  const row = (month: string) => {
    if (!months.has(month)) months.set(month, { month, added: 0, total: 0, prs: 0, prsUsing: 0, uses: 0 });
    return months.get(month)!;
  };
  for (const source of sources) row(source.meta.date.slice(0, 7)).added++;
  for (const { pr } of prs) {
    const each = row(pr.mergedAt.slice(0, 7));
    const counts = pr.used.filter((id) => ids.has(id)).length;
    each.prs++;
    each.uses += counts;
    if (counts) each.prsUsing++;
  }
  let total = 0;
  const byMonth = [...months.values()].sort((a, b) => a.month.localeCompare(b.month));
  for (const each of byMonth) each.total = total += each.added;

  return {
    total: sources.length,
    byProject: [...new Set(sources.map((source) => source.project))].map((project) => ({ project, count: sources.filter((source) => source.project === project).length })),
    withTried: sources.filter((source) => hasTried(source.body)).length,
    prs: prs.length,
    prsUsing: prs.filter(({ pr }) => pr.used.some((id) => ids.has(id))).length,
    uses: mostUsed.reduce((sum, each) => sum + each.uses.length, 0),
    mostUsed,
    neverUsed,
    untracked,
    byMonth,
    unresolved,
    repos: usage.map((each) => each.repo),
  };
}
