import Link from "next/link";
import { notFound } from "next/navigation";
import { components } from "@/mdx-components";
import { Article } from "@/components/lesson/Article";
import { findLesson, tracks } from "@/lib/content";

export const dynamicParams = false;

type Params = { params: Promise<{ track: string; slug: string }> };

export async function generateStaticParams() {
  return (await tracks()).flatMap((track) =>
    [...track.lessons, ...track.pages].map((page) => ({ track: track.slug, slug: page.slug })),
  );
}

export async function generateMetadata({ params }: Params) {
  const { track, slug } = await params;
  const found = await findLesson(track, slug);
  return { title: found?.page.meta.title, description: found?.page.meta.summary };
}

export default async function LessonPage({ params }: Params) {
  const { track: trackSlug, slug } = await params;
  const found = await findLesson(trackSlug, slug);
  if (!found) notFound();
  const { track, page, previous, next } = found;
  const { meta } = page;
  const strip = meta.number
    ? [
        { label: track.meta.title },
        { label: `Lesson ${meta.number}` },
        { label: meta.disclosure!, marked: true },
        { label: `from ${meta.sourceProject}` },
      ]
    : [{ label: track.meta.title }];
  const label = (lesson: typeof page) => lesson.meta.label ?? lesson.meta.title;

  return (
    <Article strip={strip} title={meta.title} lead={meta.number ? meta.summary : undefined}>
      <page.Content components={components} />
      {(previous || next) && (
        <nav aria-label="Lesson navigation" className="not-prose mt-16 flex justify-between gap-4 border-t border-rule pt-4 text-base">
          {previous ? (
            <Link href={previous.href} className="text-accent hover:underline">
              ← {label(previous)}
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={next.href} className="text-end text-accent hover:underline">
              {label(next)} →
            </Link>
          )}
        </nav>
      )}
    </Article>
  );
}
