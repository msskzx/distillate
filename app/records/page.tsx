import Link from "next/link";
import { Article } from "@/components/lesson/Article";
import { records } from "@/lib/content";

export const metadata = { title: "Records" };

export default async function RecordsPage() {
  const all = await records();
  const projects = [...new Set(all.map((record) => record.project))];

  return (
    <Article
      eyebrow="Records"
      title="Records"
      lead="Short notes of instructive events during work: what happened, the evidence, and the check that would have caught it."
    >
      {projects.map((project) => (
        <section key={project}>
          <h2>{project}</h2>
          <ol className="list-none ps-0">
            {all
              .filter((record) => record.project === project)
              .map((record) => (
                <li key={record.slug} className="ps-0">
                  <Link href={record.href}>{record.meta.title}</Link>
                </li>
              ))}
          </ol>
        </section>
      ))}
    </Article>
  );
}
