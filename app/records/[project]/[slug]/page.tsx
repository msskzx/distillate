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
  const all = await records();
  const titleOf = (id: string) => all.find((each) => each.id === id);
  const { meta } = record;
  const fields: [string, React.ReactNode][] = [
    ["Problem", meta.problem],
    ["Approach", meta.approach],
    ["Outcome", meta.outcome],
    ["Conditions", meta.conditions],
    ["Evidence", <span key="evidence" className="font-mono text-sm">{meta.evidence}</span>],
    ["Implication", meta.implication],
    ["Topics", meta.topics?.length ? meta.topics.map((topic) => <Link key={topic} href={`/records?topic=${topic}`} className="me-2">{topic}</Link>) : "none"],
  ];
  const links: [string, string[] | undefined][] = [
    ["Builds on", meta.buildsOn],
    ["Variant of", meta.variantOf],
  ];
  const [trackSlug, lessonSlug] = record.meta.lesson?.split("/") ?? [];
  const lesson = trackSlug ? await findLesson(trackSlug, lessonSlug) : undefined;

  return (
    <Article eyebrow={`Record · ${meta.kind} · ${record.project} · ${meta.date} · disclosure: ${meta.disclosure}`} title={meta.title}>
      <dl className="not-prose mb-10 grid gap-x-6 gap-y-3 border-b border-stone-300 pb-8 sm:grid-cols-[9rem_1fr] dark:border-stone-700">
        {fields.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="font-mono text-xs uppercase tracking-[0.12em] text-amber-700 sm:pt-1 dark:text-amber-500">{label}</dt>
            <dd className="m-0">{value}</dd>
          </div>
        ))}
        {links.map(([label, ids]) =>
          ids?.length ? (
            <div key={label} className="contents">
              <dt className="font-mono text-xs uppercase tracking-[0.12em] text-amber-700 sm:pt-1 dark:text-amber-500">{label}</dt>
              <dd className="m-0">
                {ids.map((id) => (
                  <Link key={id} href={`/records/${id}`} className="block text-amber-700 hover:underline dark:text-amber-400">
                    {titleOf(id)?.meta.title ?? id}
                  </Link>
                ))}
              </dd>
            </div>
          ) : null,
        )}
      </dl>
      <record.Content components={components} />
      {lesson && (
        <p>
          The long form is <Link href={lesson.page.href}>{lesson.page.meta.title}</Link>.
        </p>
      )}
    </Article>
  );
}
