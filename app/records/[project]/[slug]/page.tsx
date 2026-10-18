import Link from "next/link";
import { notFound } from "next/navigation";
import { components } from "@/mdx-components";
import { Article } from "@/components/lesson/Article";
import { findLesson, records } from "@/lib/content";
import { marks } from "@/lib/search";

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
    [
      "Outcome",
      <span key="outcome">
        <span aria-hidden="true" className="text-accent lg:hidden">
          {marks[meta.outcome]}{" "}
        </span>
        {meta.outcome}
      </span>,
    ],
    ["Conditions", meta.conditions],
    ["Evidence", <span key="evidence" className="font-mono text-[0.8rem] leading-relaxed [overflow-wrap:anywhere]">{meta.evidence}</span>],
    ["Implication", meta.implication],
    ["Topics", meta.topics?.length ? meta.topics.map((topic) => <Link key={topic} href={`/records?topic=${topic}`} className="me-3 font-mono text-[0.8rem] text-accent">{topic}</Link>) : "none"],
  ];
  const links: [string, string[] | undefined][] = [
    ["Builds on", meta.buildsOn],
    ["Variant of", meta.variantOf],
  ];
  const date = new Date(`${meta.date}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  const dt = "pt-0.5 text-base tracking-[0.1em] text-accent [font-variant:all-small-caps]";
  const [trackSlug, lessonSlug] = record.meta.lesson?.split("/") ?? [];
  const lesson = trackSlug ? await findLesson(trackSlug, lessonSlug) : undefined;

  return (
    <Article
      strip={[
        { label: "Record" },
        { label: meta.kind },
        { label: record.project },
        { label: date },
        { label: meta.disclosure, marked: true },
      ]}
      title={meta.title}
      lead={meta.summary}
      aside={
        <p aria-hidden="true" className="not-prose float-right clear-right -me-[16rem] mt-0 hidden w-[13.5rem] border-s border-accent ps-3 lg:block">
          <span className="block text-[2.6rem] leading-none text-accent">{marks[meta.outcome]}</span>
          <span className="tracking-[0.14em] text-accent [font-variant:all-small-caps]">{meta.outcome}</span>
        </p>
      }
    >
      <dl className="not-prose mb-10 grid gap-x-5 gap-y-1 border-b border-rule pb-7 text-[1.1875rem] leading-snug sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-y-3">
        {fields.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className={dt}>{label}</dt>
            <dd className="m-0 mb-3 min-w-0 sm:mb-0">{value}</dd>
          </div>
        ))}
        {links.map(([label, ids]) =>
          ids?.length ? (
            <div key={label} className="contents">
              <dt className={dt}>{label}</dt>
              <dd className="m-0 mb-3 min-w-0 sm:mb-0">
                {ids.map((id) => (
                  <Link key={id} href={`/records/${id}`} className="block text-accent hover:underline">
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
