import Image from "next/image";
import Link from "next/link";
import { Contents } from "@/components/lesson/Contents";
import { Star } from "@/components/lesson/Star";
import { RecordRows } from "@/components/records/RecordSearch";
import { tracks } from "@/lib/content";
import { recordIndex } from "@/lib/recordIndex";

const numerals = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x"];
const heading = "m-0 mb-1 flex items-baseline gap-3 text-2xl font-medium";
const numeral = "min-w-8 text-accent [font-variant:small-caps]";
const indent = "ms-11";

export default async function Home() {
  const all = await tracks();
  const latest = [...recordIndex].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)).slice(0, 3);

  return (
    <main className="mx-auto max-w-[38rem] px-4 pb-24 pt-20">
      <div className="flex items-center gap-4">
        <Image src="/logo.png" alt="" width={56} height={56} className="rounded-xl" priority />
        <h1 className="m-0 text-[clamp(2.4rem,1.8rem+2.4vw,3.2rem)] font-medium">Distillate</h1>
      </div>
      <p className="mb-0 mt-3 text-xl italic text-ink-soft">
        Lessons and records of what agents learned while working, written so a reader can learn it too.
      </p>
      <Star />
      <p className="m-0 text-center text-lg tracking-[0.25em] text-ink-soft [font-variant:all-small-caps]">Contents</p>

      {all.map((track, i) => (
        <section key={track.slug} className="mt-9 text-[1.1875rem]">
          <h2 className={heading}>
            <span className={numeral}>{numerals[i] ?? i + 1}.</span>
            <Link href={track.href} className="text-ink no-underline hover:text-accent">
              {track.meta.title}
            </Link>
          </h2>
          <p className={`${indent} mb-2.5 mt-0 text-[1.05rem] italic leading-snug text-ink-soft`}>{track.meta.summary}</p>
          <div className={indent}>
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
        </section>
      ))}

      <Star />
      <section className="text-[1.1875rem]">
        <h2 className={heading}>
          <span className={numeral}>✻</span>
          <Link href="/records" className="text-ink no-underline hover:text-accent">
            Records
          </Link>
        </h2>
        <p className={`${indent} mb-1 mt-0 text-[1.05rem] italic leading-snug text-ink-soft`}>
          {recordIndex.length} dated notes from work: challenges, obstacles and detours, each with its outcome and evidence. The latest:
        </p>
        <div className={indent}>
          <RecordRows records={latest} />
        </div>
      </section>
    </main>
  );
}
