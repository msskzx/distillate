import Link from "next/link";
import { prose } from "@/components/lesson/Article";
import { tracks } from "@/lib/content";

export default async function Home() {
  const all = await tracks();
  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-20">
      <div className={prose}>
        <h1>Distillate</h1>
        <p className="text-lg text-stone-600 dark:text-stone-400">
          Lessons and records of what agents learned while working, written so a reader can learn it too.
        </p>
        {all.map((track) => (
          <section key={track.slug}>
            <h2>
              <Link href={track.href}>{track.meta.title}</Link>
            </h2>
            <p>{track.meta.summary}</p>
            <p className="text-sm text-stone-500">{track.lessons.length} lessons</p>
          </section>
        ))}
        <h2>
          <Link href="/records">Records</Link>
        </h2>
        <p>Short notes of instructive events during work, each with its evidence and the check that would have caught it.</p>
      </div>
    </main>
  );
}
