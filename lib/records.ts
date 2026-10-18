import fs from "fs";
import path from "path";
import topicList from "../content/topics.json";

export const kinds = ["challenge", "obstacle", "detour"] as const;
export const outcomes = ["solved", "failed", "partial", "open"] as const;
export const topics: readonly string[] = topicList;
export const siteUrl = "https://distillate-kappa.vercel.app";

export type RecordMeta = {
  title: string;
  summary: string;
  disclosure: "open" | "generic";
  sourceProject: string;
  kind: (typeof kinds)[number];
  problem: string;
  approach: string;
  outcome: (typeof outcomes)[number];
  conditions: string;
  evidence: string;
  implication: string;
  date: string;
  topics?: string[];
  buildsOn?: string[];
  variantOf?: string[];
  lesson?: string;
};

export type RecordSource = { id: string; project: string; slug: string; meta: RecordMeta; body: string };

const required = ["title", "summary", "sourceProject", "problem", "approach", "conditions", "evidence", "implication"] as const;

export function checkRecord(meta: Partial<RecordMeta> | undefined, where: string): RecordMeta {
  const fail = (problem: string): never => {
    throw new Error(`${where}: ${problem}`);
  };
  if (!meta) return fail("missing `export const meta`");
  for (const field of required) if (typeof meta[field] !== "string" || !meta[field]!.trim()) fail(`meta.${field} is required`);
  if (meta.disclosure !== "open" && meta.disclosure !== "generic") fail("meta.disclosure must be open or generic");
  if (!kinds.includes(meta.kind!)) fail(`meta.kind must be one of ${kinds.join(", ")}`);
  if (!outcomes.includes(meta.outcome!)) fail(`meta.outcome must be one of ${outcomes.join(", ")}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.date ?? "") || Number.isNaN(Date.parse(meta.date!))) fail("meta.date must be YYYY-MM-DD");
  for (const topic of meta.topics ?? []) if (!topics.includes(topic)) fail(`meta.topics: "${topic}" is not in content/topics.json`);
  return meta as RecordMeta;
}

export function checkLinks(records: { id: string; meta: Pick<RecordMeta, "buildsOn" | "variantOf"> }[]) {
  const ids = new Set(records.map((record) => record.id));
  for (const record of records) {
    for (const link of [...(record.meta.buildsOn ?? []), ...(record.meta.variantOf ?? [])]) {
      if (!ids.has(link)) throw new Error(`${record.id}: links to "${link}", which is not a record`);
    }
  }
}

const metaBlock = /^export const meta = (\{[\s\S]*?\n\});?\n/;

export function readRecordSources(root = path.join(process.cwd(), "content", "records")): RecordSource[] {
  const all: RecordSource[] = [];
  for (const project of fs.readdirSync(root).filter((name) => !name.startsWith(".")).sort()) {
    for (const file of fs.readdirSync(path.join(root, project)).filter((name) => name.endsWith(".mdx")).sort()) {
      const source = fs.readFileSync(path.join(root, project, file), "utf8");
      const slug = file.replace(/\.mdx$/, "");
      const where = `content/records/${project}/${file}`;
      const block = metaBlock.exec(source);
      if (!block) throw new Error(`${where}: missing \`export const meta\` at the top`);
      const meta = checkRecord(new Function(`return ${block[1]}`)(), where);
      all.push({ id: `${project}/${slug}`, project, slug, meta, body: source.slice(block[0].length) });
    }
  }
  checkLinks(all);
  return all;
}

export function plainText(body: string) {
  return body
    .replace(/<RepoLink[^>]*path="([^"]+)"[^>]*\/>/g, "$1")
    .replace(/<\/?[A-Za-z][^>]*>/g, " ")
    .replace(/[*`#>[\]()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildIndex(sources: RecordSource[]) {
  const records = sources
    .map(({ id, project, slug, meta, body }) => ({
      id,
      project,
      slug,
      href: `/records/${project}/${slug}`,
      url: `${siteUrl}/records/${project}/${slug}`,
      ...meta,
      topics: meta.topics ?? [],
      buildsOn: meta.buildsOn ?? [],
      variantOf: meta.variantOf ?? [],
      text: plainText(body),
    }))
    .sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
  return `${JSON.stringify({ records }, null, 2)}\n`;
}

const leaks: [RegExp, string][] = [
  [/<RepoLink\b/, "a RepoLink"],
  [/\b(?:github|gitlab|bitbucket)\.(?:com|org)\/\S+/i, "a repository URL"],
  [/\b[\w.-]+\/[\w./-]*\.(?:tsx?|jsx?|json|mdx?|py|sql|ya?ml|go|rs|java|rb|css)\b/, "a file path"],
];

export function genericLeaks(source: string) {
  return leaks.filter(([pattern]) => pattern.test(source)).map(([, what]) => what);
}
