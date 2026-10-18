import fs from "fs";
import path from "path";
import type { MDXContent } from "mdx/types";

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

type Module = { default: MDXContent; meta?: PageMeta };

export type Page = {
  slug: string;
  href: string;
  meta: PageMeta;
  Content: MDXContent;
};

export type Track = Page & { lessons: Page[]; pages: Page[] };

export type Record = Page & { project: string };

const root = path.join(process.cwd(), "content");

const folders = (dir: string) =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

function check(meta: PageMeta | undefined, where: string, kind: "track" | "page" | "lesson" | "record"): PageMeta {
  const fail = (problem: string) => {
    throw new Error(`${where}: ${problem}`);
  };
  if (!meta) return fail("missing `export const meta`");
  if (!meta.title) fail("meta.title is required");
  if (!meta.summary) fail("meta.summary is required");
  if (kind === "lesson" && !Number.isInteger(meta.number)) fail("meta.number must be an integer");
  if (kind === "lesson" || kind === "record") {
    if (meta.disclosure !== "open" && meta.disclosure !== "generic") fail("meta.disclosure must be open or generic");
    if (!meta.sourceProject) fail("meta.sourceProject is required");
  }
  return meta;
}

async function loadTrack(slug: string): Promise<Track> {
  const track = (await import(`../content/lessons/${slug}/track.mdx`)) as Module;
  const lessons: Page[] = [];
  const pages: Page[] = [];
  for (const name of folders(path.join(root, "lessons", slug))) {
    const mod = (await import(`../content/lessons/${slug}/${name}/index.mdx`)) as Module;
    const isLesson = /^\d{4}-/.test(name);
    const where = `content/lessons/${slug}/${name}/index.mdx`;
    const page = {
      slug: name,
      href: `/${slug}/${name}`,
      meta: check(mod.meta, where, isLesson ? "lesson" : "page"),
      Content: mod.default,
    };
    (isLesson ? lessons : pages).push(page);
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
  return Promise.all(folders(path.join(root, "lessons")).map(loadTrack));
}

export async function records(): Promise<Record[]> {
  const all: Record[] = [];
  for (const project of folders(path.join(root, "records"))) {
    const files = fs
      .readdirSync(path.join(root, "records", project))
      .filter((file) => file.endsWith(".mdx"))
      .sort();
    for (const file of files) {
      const slug = file.replace(/\.mdx$/, "");
      const mod = (await import(`../content/records/${project}/${slug}.mdx`)) as Module;
      all.push({
        slug,
        project,
        href: `/records/${project}/${slug}`,
        meta: check(mod.meta, `content/records/${project}/${file}`, "record"),
        Content: mod.default,
      });
    }
  }
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
