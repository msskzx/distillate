"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { filterKeys, queryFrom, searchRecords, type IndexedRecord } from "@/lib/search";

const marks: Record<string, string> = { solved: "✓", failed: "✗", partial: "◐", open: "○" };
const field =
  "rounded border border-stone-300 bg-stone-50 px-2 py-1 text-sm dark:border-stone-700 dark:bg-stone-900";

export function RecordSearch({ records }: { records: IndexedRecord[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(params.get("q") ?? "");
  const query = { ...queryFrom(params), q };
  const results = searchRecords(records, query);
  const options = {
    topic: [...new Set(records.flatMap((record) => record.topics))].sort(),
    kind: [...new Set(records.map((record) => record.kind))].sort(),
    outcome: [...new Set(records.map((record) => record.outcome))].sort(),
    project: [...new Set(records.map((record) => record.project))].sort(),
  };

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    const search = next.toString();
    router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false });
  };

  return (
    <div className="not-prose">
      <form role="search" className="flex flex-wrap gap-2" onSubmit={(event) => event.preventDefault()}>
        <input
          type="search"
          aria-label="Search records"
          placeholder="Search problems, approaches, conditions…"
          value={q}
          onChange={(event) => {
            setQ(event.target.value);
            update("q", event.target.value.trim());
          }}
          className={`${field} min-w-0 flex-1 basis-full sm:basis-auto`}
        />
        {filterKeys.map((key) => (
          <select
            key={key}
            aria-label={`Filter by ${key}`}
            value={params.get(key) ?? ""}
            onChange={(event) => update(key, event.target.value)}
            className={field}
          >
            <option value="">Any {key}</option>
            {options[key].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        ))}
      </form>
      <p role="status" className="mt-4 text-sm text-stone-600 dark:text-stone-400">
        {results.length} of {records.length} records
      </p>
      <ol className="mt-2 divide-y divide-stone-200 dark:divide-stone-800">
        {results.map((record) => (
          <li key={record.id} className="py-3">
            <Link href={record.href} className="group flex gap-3">
              <span aria-hidden="true" className="w-4 shrink-0 text-amber-700 dark:text-amber-500">
                {marks[record.outcome]}
              </span>
              <span className="min-w-0">
                <span className="block group-hover:text-amber-700 dark:group-hover:text-amber-400">{record.problem}</span>
                <span className="mt-1 block font-mono text-xs text-stone-500 dark:text-stone-400">
                  <span className="sr-only">Outcome: </span>
                  {record.outcome} · {record.kind} · {record.project} · {record.date}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
