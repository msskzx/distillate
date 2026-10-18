import type { ReactNode } from "react";

export const prose = "prose max-w-none font-serif";

export const leaf = "leaf mx-auto max-w-[50rem] px-4 pb-24 pt-20 lg:max-w-[66rem] lg:pe-[17rem]";

export type StripItem = { label: string; marked?: boolean };

export function Strip({ items }: { items: StripItem[] }) {
  return (
    <p className="m-0 mb-7 flex flex-wrap gap-y-1 border-y-[3px] border-double border-rule py-1.5 text-base tracking-[0.1em] text-ink-soft [font-variant:all-small-caps]">
      {items.map((item, i) => (
        <span key={item.label} className={item.marked ? "text-accent" : undefined}>
          {i > 0 && (
            <span aria-hidden="true" className="mx-2.5 text-rule">
              ·
            </span>
          )}
          {item.label}
        </span>
      ))}
    </p>
  );
}

export function Article({
  strip,
  title,
  lead,
  aside,
  wide = false,
  children,
}: {
  strip: StripItem[];
  title: string;
  lead?: string;
  aside?: ReactNode;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <main className={wide ? "leaf leaf-wide mx-auto max-w-[100rem] px-4 pb-24 pt-20" : leaf}>
      <article className={prose}>
        <header className="not-prose mb-8">
          <Strip items={strip} />
          <h1 className="m-0 mb-2 text-[clamp(2rem,1.4rem+2.4vw,2.75rem)] font-medium leading-tight text-balance">{title}</h1>
          {lead && <p className="m-0 text-xl italic text-ink-soft">{lead}</p>}
        </header>
        {aside}
        {children}
      </article>
    </main>
  );
}
