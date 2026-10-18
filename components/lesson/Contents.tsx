import Link from "next/link";

export type Entry = { href: string; label: string; number?: number };

export function Contents({ entries }: { entries: Entry[] }) {
  return (
    <ol className="m-0 list-none p-0">
      {entries.map((entry) => (
        <li key={entry.href} className="m-0 p-0">
          <Link href={entry.href} className="group flex items-baseline gap-1.5 py-0.5 text-ink no-underline hover:text-accent">
            <span className={`min-w-0 ${entry.number === undefined ? "italic text-ink-soft group-hover:text-accent" : ""}`}>
              {entry.label}
            </span>
            <span aria-hidden="true" className="min-w-6 flex-1 -translate-y-[0.3em] border-b border-dotted border-rule" />
            <span className="text-ink-soft [font-variant-numeric:lining-nums_tabular-nums]">{entry.number}</span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
