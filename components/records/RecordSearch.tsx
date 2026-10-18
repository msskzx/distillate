"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { RecordGraph } from "./RecordGraph";
import { filterKeys, marks, queryFrom, searchRecords, type IndexedRecord } from "@/lib/search";

const field =
  "rounded-sm border border-rule bg-paper px-2 py-1 text-base text-ink placeholder:italic placeholder:text-ink-soft focus:border-accent focus:outline-none";

export function RecordSearch({ records, graph = false }: { records: IndexedRecord[]; graph?: boolean }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const urlQ = params.get("q") ?? "";
  const [q, setQ] = useState(urlQ);
  const [seenQ, setSeenQ] = useState(urlQ);
  const pushed = useRef<string[]>([]);
  if (urlQ !== seenQ) {
    setSeenQ(urlQ);
    if (!pushed.current.includes(urlQ)) {
      pushed.current = [];
      setQ(urlQ);
    }
  }
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
    const typed = key === "q" ? value : q.trim();
    if (typed) next.set("q", typed);
    else next.delete("q");
    if (key !== "q") {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    pushed.current = [...pushed.current.slice(-19), typed];
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
      <p role="status" className="mt-4 text-base italic text-ink-soft">
        {results.length} of {records.length} records
      </p>
      {graph ? <RecordGraph records={records} matches={results} /> : <RecordRows records={results} />}
    </div>
  );
}

export function RecordRows({ records }: { records: IndexedRecord[] }) {
  return (
    <ol className="m-0 mt-2 list-none p-0">
      {records.map((record) => (
        <li key={record.id} className="m-0 border-b border-rule p-0 py-2.5">
          <Link href={record.href} className="group grid grid-cols-[1.75rem_minmax(0,1fr)] gap-2 text-ink no-underline">
            <span aria-hidden="true" className="text-center text-[1.15rem] leading-snug text-accent">
              {marks[record.outcome]}
            </span>
            <span className="min-w-0">
              <span className="block leading-snug group-hover:text-accent">{record.problem}</span>
              <span className="mt-1 block font-mono text-xs text-ink-soft">
                <span className="sr-only">Outcome: </span>
                {record.outcome} · {record.kind} · {record.project} · {record.date}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
