import type { ReactNode } from "react";

const tones = {
  insight: "border-amber-600 bg-amber-50 dark:bg-amber-950/40",
  note: "border-stone-400 bg-stone-100 dark:border-stone-600 dark:bg-stone-900",
  warning: "border-red-600 bg-red-50 dark:bg-red-950/40",
};

export function Callout({
  tone = "insight",
  title,
  children,
}: {
  tone?: keyof typeof tones;
  title?: string;
  children: ReactNode;
}) {
  return (
    <aside className={`not-prose my-6 rounded-e border-s-4 px-5 py-4 ${tones[tone]}`}>
      {title && <p className="mb-2 font-semibold">{title}</p>}
      <div className="prose prose-stone max-w-none dark:prose-invert [&>:first-child]:mt-0 [&>:last-child]:mb-0">
        {children}
      </div>
    </aside>
  );
}
