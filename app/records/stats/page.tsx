import Link from "next/link";
import { Article } from "@/components/lesson/Article";
import { readRecordSources } from "@/lib/records";
import { prUrl, readUsage, stats } from "@/lib/usage";

export const metadata = { title: "Record stats" };

const monthName = (month: string) =>
  new Date(`${month}-01T00:00:00Z`).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });

const dt = "text-base tracking-[0.1em] text-accent [font-variant:all-small-caps]";

function Bar({ value, max, label }: { value: number; max: number; label: string }) {
  return (
    <span className="block h-2 w-full" title={label}>
      {value > 0 && <span className="block h-full rounded-e-[4px] bg-accent" style={{ width: `${(value / max) * 100}%` }} />}
    </span>
  );
}

export default function RecordStatsPage() {
  const sources = readRecordSources();
  const s = stats(sources, readUsage());
  const used = s.mostUsed.length;
  const maxUses = Math.max(1, ...s.mostUsed.map((each) => each.uses.length));
  const maxMonth = Math.max(1, ...s.byMonth.map((each) => each.uses));
  const tiles: [string, string | number, string][] = [
    ["Records", s.total, s.byProject.map((each) => `${each.count} ${each.project}`).join(" · ")],
    ["Used", used, `at least once, ${s.uses} uses in all`],
    ["Never used", s.neverUsed.length, "not named by any PR yet"],
    ["With “Tried”", s.withTried, "list the attempts that failed"],
    ["PRs read", s.prs, `${s.prsUsing} named a record`],
  ];

  return (
    <Article
      strip={[{ label: "Records" }, { label: "Stats" }, { label: `${s.prs} merged PRs` }]}
      title="Record stats"
      lead="How many records there are, when they were written, and which ones work has leaned on. Each merged pull request ends with a “Records used:” line; every count here is built from those lines when the site is built."
    >
      <p>
        <Link href="/records">← All records</Link>
      </p>

      <dl className="not-prose mb-10 grid grid-cols-2 gap-x-6 gap-y-5 border-y border-rule py-6 sm:grid-cols-3 lg:grid-cols-5">
        {tiles.map(([label, value, note]) => (
          <div key={label} className="min-w-0">
            <dt className={dt}>{label}</dt>
            <dd className="m-0 text-[2.4rem] leading-none text-ink [font-variant-numeric:lining-nums]">{value}</dd>
            <dd className="m-0 mt-1 text-sm italic leading-snug text-ink-soft">{note}</dd>
          </div>
        ))}
      </dl>

      <h2>By month</h2>
      <p>
        Records count in the month of their date; uses count in the month their pull request merged. Lines read from{" "}
        {s.repos.map((repo, i) => (
          <span key={repo}>
            {i > 0 && ", "}
            <a href={`https://github.com/${repo}/pulls?q=is%3Apr+is%3Amerged`}>{repo}</a>
          </span>
        ))}
        .
      </p>
      <div className="not-prose overflow-x-auto">
        <table className="w-full min-w-[34rem] border-collapse text-base">
          <thead>
            <tr className="border-b border-ink-soft text-start">
              {["Month", "Added", "Total", "PRs", "Named a record", "Uses", ""].map((head) => (
                <th key={head} className={`${dt} py-1.5 pe-3 text-start font-normal`}>
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="[font-variant-numeric:lining-nums_tabular-nums]">
            {s.byMonth.map((row) => (
              <tr key={row.month} className="border-b border-rule">
                <td className="py-1.5 pe-3">{monthName(row.month)}</td>
                <td className="pe-3">{row.added}</td>
                <td className="pe-3">{row.total}</td>
                <td className="pe-3">{row.prs}</td>
                <td className="pe-3">{row.prsUsing}</td>
                <td className="pe-3">{row.uses}</td>
                <td className="w-1/4">
                  <Bar value={row.uses} max={maxMonth} label={`${row.uses} uses in ${monthName(row.month)}`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Most used</h2>
      <ol className="not-prose m-0 list-none p-0">
        {s.mostUsed.map(({ source, uses }) => (
          <li key={source.id} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-3 border-b border-rule py-2 sm:grid-cols-[2.5rem_minmax(0,1fr)_9rem]">
            <span className="text-xl leading-tight text-accent [font-variant-numeric:lining-nums]">{uses.length}</span>
            <span className="min-w-0">
              <Link href={`/records/${source.id}`} className="text-ink hover:text-accent hover:underline">
                {source.meta.title}
              </Link>
              <span className="block font-mono text-[0.75rem] text-ink-soft">
                {source.id} · last{" "}
                <a href={prUrl(uses.at(-1)!.repo, uses.at(-1)!.pr.number)} className="text-accent hover:underline">
                  #{uses.at(-1)!.pr.number}
                </a>
              </span>
            </span>
            <span className="col-start-2 mt-1 self-center sm:col-start-3 sm:mt-0">
              <Bar value={uses.length} max={maxUses} label={`${uses.length} uses`} />
            </span>
          </li>
        ))}
      </ol>

      <h2>Never used</h2>
      <p>No merged pull request has named these yet. Some are new; some may want a better title or summary so a search finds them.</p>
      <ul className="not-prose m-0 list-none columns-1 gap-8 p-0 sm:columns-2">
        {s.neverUsed.map((source) => (
          <li key={source.id} className="break-inside-avoid py-1 leading-snug">
            <Link href={`/records/${source.id}`} className="text-ink hover:text-accent hover:underline">
              {source.meta.title}
            </Link>{" "}
            <span className="font-mono text-[0.75rem] text-ink-soft">{source.id}</span>
          </li>
        ))}
      </ul>

      {s.unresolved.length > 0 && (
        <>
          <h2>Not counted</h2>
          <p>Names on a “Records used:” line that point at no single record. A number two records share counts for neither; the full id settles it.</p>
          <div className="not-prose overflow-x-auto">
            <table className="w-full min-w-[30rem] border-collapse text-base">
              <thead>
                <tr className="border-b border-ink-soft">
                  {["PR", "Named", "Why"].map((head) => (
                    <th key={head} className={`${dt} py-1.5 pe-3 text-start font-normal`}>
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {s.unresolved.map((each) => (
                  <tr key={`${each.pr.number}-${each.text}`} className="border-b border-rule align-top">
                    <td className="py-1.5 pe-3">
                      <a href={prUrl(each.repo, each.pr.number)} className="text-accent hover:underline">
                        #{each.pr.number}
                      </a>
                    </td>
                    <td className="pe-3 font-mono text-[0.8rem] [overflow-wrap:anywhere]">{each.text}</td>
                    <td className="italic text-ink-soft">{each.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Article>
  );
}
