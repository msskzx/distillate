import type { ReactNode } from "react";
import { prUrl } from "@/lib/usage";

// Turns "#524", "PR #524" and "distillate PR #4" in an open record's text into
// links to that pull request. A project named before "PR" picks the repository;
// otherwise it is the record's own source project.
export function PrLinks({ text, project }: { text: string; project: string }) {
  const parts: ReactNode[] = [];
  let at = 0;
  for (const m of text.matchAll(/(?:\b(namaq|distillate) )?(?:PRs? )?#(\d+)\b/gi)) {
    parts.push(text.slice(at, m.index));
    const repo = `msskzx/${(m[1] ?? project).toLowerCase()}`;
    parts.push(
      <a key={m.index} href={prUrl(repo, Number(m[2]))} className="text-accent hover:underline">
        {m[0]}
      </a>,
    );
    at = m.index + m[0].length;
  }
  parts.push(text.slice(at));
  return <>{parts}</>;
}
