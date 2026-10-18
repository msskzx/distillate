import type { ReactNode } from "react";

const tones = {
  insight: "border-s-2 border-accent bg-paper-deep",
  note: "border-s-2 border-rule",
  warning: "border-s-[5px] border-double border-accent bg-accent-wash",
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
    <aside className={`not-prose my-7 px-5 py-4 ${tones[tone]}`}>
      {title && <p className="mb-1.5 mt-0 text-lg tracking-[0.06em] text-accent [font-variant:all-small-caps]">{title}</p>}
      <div className="prose max-w-none text-[1.125rem] leading-[1.6] [&>:first-child]:mt-0 [&>:last-child]:mb-0">
        {children}
      </div>
    </aside>
  );
}
