import Link from "next/link";
import { notFound } from "next/navigation";
import { components } from "@/mdx-components";
import { Article } from "@/components/lesson/Article";
import { number, tracks } from "@/lib/content";

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await tracks()).map((track) => ({ track: track.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ track: string }> }) {
  const { track: slug } = await params;
  const track = (await tracks()).find((each) => each.slug === slug);
  return { title: track?.meta.title };
}

export default async function TrackPage({ params }: { params: Promise<{ track: string }> }) {
  const { track: slug } = await params;
  const track = (await tracks()).find((each) => each.slug === slug);
  if (!track) notFound();

  return (
    <Article eyebrow="Track" title={track.meta.title} lead={track.meta.summary}>
      <track.Content components={components} />
      <h2>Lessons</h2>
      <ol className="list-none ps-0">
        {track.lessons.map((lesson) => (
          <li key={lesson.slug} className="ps-0">
            <Link href={lesson.href}>
              {number(lesson.meta.number!)} · {lesson.meta.title}
            </Link>
            <br />
            <span className="text-sm text-stone-600 dark:text-stone-400">{lesson.meta.summary}</span>
          </li>
        ))}
      </ol>
      {track.pages.length > 0 && (
        <>
          <h2>Workspace</h2>
          <ul>
            {track.pages.map((page) => (
              <li key={page.slug}>
                <Link href={page.href}>{page.meta.title}</Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </Article>
  );
}
