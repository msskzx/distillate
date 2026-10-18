"use client";

import Link from "next/link";
import { useId, useState } from "react";
import type { IndexedRecord } from "@/lib/search";

const columnWidth = 280;
const rowHeight = 100;
const nodeWidth = 228;
const nodeHeight = 76;

export function RecordGraph({ records, matches }: { records: IndexedRecord[]; matches: IndexedRecord[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const markerId = useId().replace(/:/g, "");
  const projects = [...new Set(records.map((record) => record.project))].sort();
  const columns = projects.map((project) => records
    .filter((record) => record.project === project)
    .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id)));
  const positions = new Map(columns.flatMap((column, x) => column.map((record, y) => [record.id, {
    x: x * columnWidth + 26,
    y: y * rowHeight + 48,
  }] as const)));
  const matchingIds = new Set(matches.map((record) => record.id));
  const selected = records.find((record) => record.id === selectedId);
  const width = Math.max(1, columns.length) * columnWidth;
  const height = Math.max(1, ...columns.map((column) => column.length)) * rowHeight + 48;
  const edges = records.flatMap((record) => [
    ...record.buildsOn.map((target) => ({ source: record.id, target, kind: "buildsOn" })),
    ...record.variantOf.map((target) => ({ source: record.id, target, kind: "variantOf" })),
  ]).filter((edge, index, all) => positions.has(edge.target) && (edge.kind !== "variantOf" || !all.slice(0, index).some(
    (other) => other.kind === edge.kind && other.source === edge.target && other.target === edge.source,
  )));

  if (!records.length) return <p className="mt-4 text-ink-soft">No records yet.</p>;

  return (
    <div className="mt-4">
      <p className="mb-3 text-sm text-ink-soft">
        Only recorded relationships are shown. Columns group projects; records run oldest to newest. Select a record to read its details.
      </p>
      <ul aria-label="Graph legend" className="mb-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-soft">
        <li><span aria-hidden="true">──→ </span>Builds on (arrow points to the referenced work)</li>
        <li><span aria-hidden="true">┄┄ </span>Variant of</li>
        <li>Faded records do not match the search</li>
      </ul>
      {matches.length === 0 && <p className="mb-3 text-sm">No matching records. The full graph remains visible for context.</p>}
      <div role="region" aria-label="Record relationships" tabIndex={0} className="max-h-[32rem] overflow-auto rounded-sm border border-rule bg-paper-deep focus-visible:outline-2 focus-visible:outline-accent">
        <div className="relative" style={{ width, height }}>
          {projects.map((project, index) => (
            <p key={project} className="absolute top-4 font-mono text-xs uppercase tracking-[0.1em] text-ink-soft" style={{ left: index * columnWidth + 26 }}>{project}</p>
          ))}
          <svg role="group" aria-label="Recorded relationships" width={width} height={height} className="pointer-events-none absolute inset-0 text-ink-soft">
            <defs>
              <marker id={markerId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
              </marker>
            </defs>
            {edges.map((edge) => {
              const source = positions.get(edge.source)!;
              const target = positions.get(edge.target)!;
              const sameColumn = source.x === target.x;
              const fromX = source.x + (sameColumn || target.x > source.x ? nodeWidth : 0);
              const toX = target.x + (sameColumn || source.x > target.x ? nodeWidth : 0);
              const selfLink = edge.source === edge.target;
              const fromY = source.y + nodeHeight / 2 - (selfLink ? 12 : 0);
              const toY = target.y + nodeHeight / 2 + (selfLink ? 12 : 0);
              const bend = sameColumn ? fromX + 32 : (fromX + toX) / 2;
              const sourceRecord = records.find((record) => record.id === edge.source)!;
              const targetRecord = records.find((record) => record.id === edge.target)!;
              const label = `${sourceRecord.title} ${edge.kind === "buildsOn" ? "builds on" : "variant of"} ${targetRecord.title}`;
              return <path role="img" aria-label={label} key={`${edge.kind}-${edge.source}-${edge.target}`} data-relationship={edge.kind} d={`M ${fromX} ${fromY} C ${bend} ${fromY}, ${bend} ${toY}, ${toX} ${toY}`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray={edge.kind === "variantOf" ? "5 4" : undefined} markerEnd={edge.kind === "buildsOn" ? `url(#${markerId})` : undefined}><title>{label}</title></path>;
            })}
          </svg>
          {columns.flat().map((record) => {
            const position = positions.get(record.id)!;
            const matchesSearch = matchingIds.has(record.id);
            return (
              <button
                key={record.id}
                type="button"
                aria-label={`${record.title} · ${record.outcome} · ${record.project}${matchesSearch ? "" : " · does not match search"}`}
                aria-pressed={selectedId === record.id}
                onClick={() => setSelectedId(record.id)}
                className={`absolute rounded-sm border bg-paper px-3 py-2 text-left text-ink transition-colors hover:border-accent focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${selectedId === record.id ? "border-accent ring-1 ring-accent" : "border-rule"} ${matchesSearch ? "" : "opacity-40 hover:opacity-100 focus-visible:opacity-100"}`}
                style={{ left: position.x, top: position.y, width: nodeWidth, height: nodeHeight }}
              >
                <span className="line-clamp-2 text-base leading-4">{record.title}</span>
                <span className="mt-1 block font-mono text-[10px] text-ink-soft">{record.outcome} · {record.date}</span>
              </button>
            );
          })}
        </div>
      </div>
      {selected ? (
        <section aria-label="Selected record" className="mt-6 border-t border-rule pt-5">
          <h2 className="text-xl font-semibold">{selected.title}</h2>
          <p className="mt-1 font-mono text-xs text-ink-soft">{selected.project} · {selected.kind} · {selected.date}</p>
          <dl className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-[7rem_1fr]">
            {([ ["Problem", selected.problem], ["Approach", selected.approach], ["Outcome", selected.outcome], ["Conditions", selected.conditions], ["Evidence", selected.evidence] ]).map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="font-mono text-xs uppercase tracking-[0.1em] text-accent sm:pt-1">{label}</dt>
                <dd className={`m-0 min-w-0 break-words ${label === "Evidence" ? "font-mono text-sm" : ""}`}>{value}</dd>
              </div>
            ))}
          </dl>
          <ul aria-label="Selected record relationships" className="mt-5 space-y-2 text-sm">
            {edges.filter((edge) => edge.source === selected.id || edge.target === selected.id).map((edge) => {
              const outgoing = edge.source === selected.id;
              const otherId = outgoing ? edge.target : edge.source;
              const other = records.find((record) => record.id === otherId)!;
              const label = edge.kind === "variantOf" ? "Variant of" : outgoing ? "Builds on" : "Built on by";
              return <li key={`${edge.kind}-${otherId}`}>{label}: <Link href={other.href} className="text-accent hover:underline">{other.title}</Link></li>;
            })}
          </ul>
          <Link href={selected.href} className="mt-5 inline-block text-accent hover:underline">Read full record →</Link>
        </section>
      ) : <p className="mt-4 text-sm text-ink-soft">Select a record to see its problem, approach, outcome and evidence.</p>}
    </div>
  );
}
