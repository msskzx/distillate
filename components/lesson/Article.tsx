import type { ReactNode } from "react";

export const prose =
  "prose prose-stone max-w-none dark:prose-invert prose-headings:font-semibold prose-pre:rounded-s-none prose-pre:border-s-4 prose-pre:border-amber-600 prose-pre:bg-amber-50 prose-pre:text-stone-800 dark:prose-pre:bg-stone-900 dark:prose-pre:text-stone-200 prose-code:font-mono prose-a:text-amber-700 dark:prose-a:text-amber-400";

export function Article({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-20">
      <article className={prose}>
        <header className="mb-10 border-b border-stone-300 pb-6 dark:border-stone-700">
          <p className="m-0 font-mono text-xs uppercase tracking-[0.12em] text-amber-700 dark:text-amber-500">{eyebrow}</p>
          <h1 className="mb-2 mt-3">{title}</h1>
          {lead && <p className="m-0 text-lg text-stone-600 dark:text-stone-400">{lead}</p>}
        </header>
        {children}
      </article>
    </main>
  );
}
