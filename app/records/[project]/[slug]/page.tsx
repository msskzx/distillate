import Link from "next/link";
import { notFound } from "next/navigation";
import { components } from "@/mdx-components";
import { Article } from "@/components/lesson/Article";
import { findLesson, records } from "@/lib/content";

export const dynamicParams = false;

type Params = { params: Promise<{ project: string; slug: string }> };

export async function generateStaticParams() {
  return (await records()).map((record) => ({ project: record.project, slug: record.slug }));
}

async function find(params: Params["params"]) {
  const { project, slug } = await params;
  return (await records()).find((record) => record.project === project && record.slug === slug);
}

export async function generateMetadata({ params }: Params) {
  const record = await find(params);
  return { title: record?.meta.title, description: record?.meta.summary };
}

export default async function RecordPage({ params }: Params) {
  const record = await find(params);
  if (!record) notFound();
  const [trackSlug, lessonSlug] = record.meta.lesson?.split("/") ?? [];
  const lesson = trackSlug ? await findLesson(trackSlug, lessonSlug) : undefined;

  return (
    <Article eyebrow={`Record · ${record.project} · ${record.meta.disclosure}`} title={record.meta.title}>
      <record.Content components={components} />
      {lesson && (
        <p>
          The long form is <Link href={lesson.page.href}>{lesson.page.meta.title}</Link>.
        </p>
      )}
    </Article>
  );
}
