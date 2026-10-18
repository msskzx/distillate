import type { ReactNode } from "react";

export function RepoLink({ repo, path, children }: { repo: string; path: string; children?: ReactNode }) {
  return <a href={`https://github.com/msskzx/${repo}/blob/main/${path}`}>{children ?? <code>{path}</code>}</a>;
}
