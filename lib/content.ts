import fs from "fs";
import path from "path";
import type { MDXContent } from "mdx/types";
import { checkLinks, checkRecord, type RecordMeta } from "./records";

export type Disclosure = "open" | "generic";

export type PageMeta = {
  title: string;
  label?: string;
  summary: string;
  number?: number;
  disclosure?: Disclosure;
  sourceProject?: string;
  lesson?: string;
};

export type RecordPageMeta = PageMeta & RecordMeta;

type Module = { default: MDXContent; meta?: PageMeta };

export type Page = {
  slug: string;
  href: string;
  meta: PageMeta;
  Content: MDXContent;
};

export type Track = Page & { lessons: Page[]; pages: Page[] };

export type Record = Omit<Page, "meta"> & { project: string; id: string; meta: RecordPageMeta };

const root = path.join(process.cwd(), "content");

const lessonFolder = /^(\d{4})-[a-z0-9-]+$/;
const pageFolder = /^[a-z][a-z-]*$/;
const recordFile = /^\d{4}-[a-z0-9-]+\.mdx$/;

export function entries(dir: string, allowedFiles: (name: string) => boolean = () => false) {
  const folders: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    if (entry.isDirectory()) folders.push(entry.name);
    else if (!allowedFiles(entry.name)) throw new Error(`${path.relative(process.cwd(), dir)}/${entry.name}: unexpected file`);
  }
  return folders.sort();
}

export function check(meta: PageMeta | undefined, where: string, kind: "track" | "page" | "lesson"): PageMeta {
  const fail = (problem: string) => {
    throw new Error(`${where}: ${problem}`);
  };
  if (!meta) return fail("missing `export const meta`");
  if (!meta.title) fail("meta.title is required");
  if (!meta.summary) fail("meta.summary is required");
  if (kind === "lesson" && !Number.isInteger(meta.number)) fail("meta.number must be an integer");
  if (kind === "lesson") {
    if (meta.disclosure !== "open" && meta.disclosure !== "generic") fail("meta.disclosure must be open or generic");
    if (!meta.sourceProject) fail("meta.sourceProject is required");
  }
  return meta;
}

async function loadTrack(slug: string): Promise<Track> {
  const track = (await import(`../content/lessons/${slug}/track.mdx`)) as Module;
  const lessons: Page[] = [];
  const pages: Page[] = [];
  for (const name of entries(path.join(root, "lessons", slug), (file) => file === "track.mdx")) {
    const where = `content/lessons/${slug}/${name}/index.mdx`;
    const numbered = lessonFolder.exec(name);
    if (!numbered && !pageFolder.test(name)) throw new Error(`${where}: folder must be NNNN-slug or a lowercase page name`);
    const mod = (await import(`../content/lessons/${slug}/${name}/index.mdx`)) as Module;
    const meta = check(mod.meta, where, numbered ? "lesson" : "page");
    if (numbered && meta.number !== Number(numbered[1])) throw new Error(`${where}: meta.number does not match the folder`);
    (numbered ? lessons : pages).push({ slug: name, href: `/${slug}/${name}`, meta, Content: mod.default });
  }
  lessons.sort((a, b) => a.meta.number! - b.meta.number!);
  return {
    slug,
    href: `/${slug}`,
    meta: check(track.meta, `content/lessons/${slug}/track.mdx`, "track"),
    Content: track.default,
    lessons,
    pages,
  };
}

export async function tracks(): Promise<Track[]> {
  const slugs = entries(path.join(root, "lessons"));
  if (slugs.includes("records")) throw new Error("content/lessons/records: a track cannot be named records");
  return Promise.all(slugs.map(loadTrack));
}

export async function records(): Promise<Record[]> {
  const all: Record[] = [];
  for (const project of entries(path.join(root, "records"))) {
    const dir = path.join(root, "records", project);
    if (entries(dir, (file) => recordFile.test(file)).length) throw new Error(`content/records/${project}: records cannot be nested`);
    for (const file of fs.readdirSync(dir).filter((name) => !name.startsWith(".")).sort()) {
      const slug = file.replace(/\.mdx$/, "");
      const mod = (await import(`../content/records/${project}/${slug}.mdx`)) as Module;
      all.push({
        slug,
        project,
        id: `${project}/${slug}`,
        href: `/records/${project}/${slug}`,
        meta: checkRecord(mod.meta as Partial<RecordMeta>, `content/records/${project}/${file}`),
        Content: mod.default,
      });
    }
  }
  checkLinks(all);
  return all;
}

export async function findLesson(trackSlug: string, slug: string) {
  const track = (await tracks()).find((each) => each.slug === trackSlug);
  if (!track) return undefined;
  const index = track.lessons.findIndex((each) => each.slug === slug);
  const page = index >= 0 ? track.lessons[index] : track.pages.find((each) => each.slug === slug);
  if (!page) return undefined;
  return {
    track,
    page,
    previous: index > 0 ? track.lessons[index - 1] : undefined,
    next: index >= 0 ? track.lessons[index + 1] : undefined,
  };
}

export const number = (n: number) => String(n).padStart(4, "0");

export const lessonLabel = (lesson: Page) => `${number(lesson.meta.number!)} · ${lesson.meta.label ?? lesson.meta.title}`;
