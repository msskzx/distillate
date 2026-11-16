import Link from "next/link";
import { notFound } from "next/navigation";
import { components } from "@/mdx-components";
import { Article } from "@/components/lesson/Article";
import { findLesson, records } from "@/lib/content";
import { readRecordSources } from "@/lib/records";
import { marks } from "@/lib/search";
import { fileUrl, prUrl, readUsage, recordStats, type Use } from "@/lib/usage";
import { PrLinks } from "@/components/records/PrLinks";

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
  const body = readRecordSources().find((each) => each.id === record.id)?.body ?? "";
  const use = recordStats(record.id, body, readUsage());
  const pr = (each: Use) => (
    <a href={prUrl(each.repo, each.pr.number)} className="text-accent hover:underline" title={each.pr.title}>
      #{each.pr.number}
    </a>
  );
  const day = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
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
    ["Evidence", <span key="evidence" className="font-mono text-[0.8rem] leading-relaxed [overflow-wrap:anywhere]">{meta.disclosure === "open" ? <PrLinks text={meta.evidence} project={record.project} /> : meta.evidence}</span>],
    ["Implication", meta.implication],
    ["Topics", meta.topics?.length ? meta.topics.map((topic) => <Link key={topic} href={`/records?topic=${topic}`} className="me-3 font-mono text-[0.8rem] text-accent">{topic}</Link>) : "none"],
  ];
  const usage: [string, React.ReactNode][] = [
    [
      "Used",
      use.first && use.last ? (
        <span key="used">
          {use.uses.length === 1 ? "once" : `${use.uses.length} times`}, {use.uses.length === 1 ? "in" : "first in"} {pr(use.first)} ({day(use.first.pr.mergedAt)})
          {use.uses.length > 1 && (
            <>
              , last in {pr(use.last)} ({day(use.last.pr.mergedAt)})
            </>
          )}
        </span>
      ) : (
        "not yet named by a merged PR"
      ),
    ],
    ...(use.source
      ? ([
          [
            "Added in",
            use.source.createdIn ? (
              <a key="added" href={prUrl(use.source.repo, use.source.createdIn)} className="text-accent hover:underline">
                #{use.source.createdIn}
              </a>
            ) : (
              "a commit with no pull request"
            ),
          ],
          [
            "File",
            <a key="file" href={fileUrl(use.source.repo, use.source.file)} className="font-mono text-[0.8rem] text-accent hover:underline [overflow-wrap:anywhere]">
              {use.source.file}
            </a>,
          ],
        ] as [string, React.ReactNode][])
      : []),
    ["Tried", use.tried ? "lists the attempts that failed (below)" : "no list of attempts"],
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
      <section aria-label="Use" className="not-prose mb-10 border-b border-rule pb-7">
        <p className="m-0 mb-3 text-base tracking-[0.1em] text-ink-soft [font-variant:all-small-caps]">
          Use · <Link href="/records/stats" className="text-accent hover:underline">all record stats</Link>
        </p>
        <dl className="m-0 grid gap-x-5 gap-y-1 text-[1.1875rem] leading-snug sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-y-3">
          {usage.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className={dt}>{label}</dt>
              <dd className="m-0 mb-3 min-w-0 sm:mb-0">{value}</dd>
            </div>
          ))}
        </dl>
      </section>
      <record.Content components={components} />
      {lesson && (
        <p>
          The long form is <Link href={lesson.page.href}>{lesson.page.meta.title}</Link>.
        </p>
      )}
    </Article>
  );
}
