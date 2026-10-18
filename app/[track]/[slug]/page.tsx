import Link from "next/link";
import { notFound } from "next/navigation";
import { components } from "@/mdx-components";
import { Article } from "@/components/lesson/Article";
import { findLesson, lessonLabel, number, tracks } from "@/lib/content";

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
  const eyebrow = meta.number
    ? `Lesson ${number(meta.number)} · ${track.meta.title} · ${meta.disclosure}`
    : track.meta.title;

  return (
    <Article eyebrow={eyebrow} title={meta.title}>
      <page.Content components={components} />
      {(previous || next) && (
        <nav aria-label="Lesson navigation" className="not-prose mt-16 flex justify-between gap-4 border-t border-stone-300 pt-6 text-sm dark:border-stone-700">
          {previous ? (
            <Link href={previous.href} className="text-amber-700 hover:underline dark:text-amber-400">
              ← {lessonLabel(previous)}
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={next.href} className="text-end text-amber-700 hover:underline dark:text-amber-400">
              {lessonLabel(next)} →
            </Link>
          )}
        </nav>
      )}
    </Article>
  );
}
