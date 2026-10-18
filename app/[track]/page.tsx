import { notFound } from "next/navigation";
import { components } from "@/mdx-components";
import { Article } from "@/components/lesson/Article";
import { Contents } from "@/components/lesson/Contents";
import { Star } from "@/components/lesson/Star";
import { tracks } from "@/lib/content";

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
    <Article strip={[{ label: "Track" }, { label: `${track.lessons.length} lessons` }]} title={track.meta.title} lead={track.meta.summary}>
      <track.Content components={components} />
      <Star />
      <div className="not-prose">
        <p className="m-0 mb-3 text-center text-lg tracking-[0.25em] text-ink-soft [font-variant:all-small-caps]">Contents</p>
        <Contents
          entries={[
            ...track.lessons.map((lesson) => ({
              href: lesson.href,
              label: lesson.meta.label ?? lesson.meta.title,
              number: lesson.meta.number,
            })),
            ...track.pages.map((page) => ({ href: page.href, label: page.meta.title })),
          ]}
        />
      </div>
    </Article>
  );
}
