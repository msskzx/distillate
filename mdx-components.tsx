import type { MDXComponents } from "mdx/types";
import { Children, isValidElement, type ReactNode } from "react";
import { Star } from "@/components/lesson/Star";
import { ArabicQuote } from "@/components/mdx/ArabicQuote";
import { Callout } from "@/components/mdx/Callout";
import { Margin } from "@/components/mdx/Margin";
import { Mermaid } from "@/components/mdx/Mermaid";
import { Quiz } from "@/components/mdx/Quiz";
import { RepoLink } from "@/components/mdx/RepoLink";
import { Stepper } from "@/components/mdx/Stepper";

function text(node: ReactNode): string {
  return Children.toArray(node)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number") return String(child);
      if (isValidElement<{ children?: ReactNode }>(child)) return text(child.props.children);
      return "";
    })
    .join("");
}

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const numbered = /^(\d+)\.\s+/;

function H2({ children }: { children?: ReactNode }) {
  const parts = Children.toArray(children);
  const first = parts[0];
  const match = typeof first === "string" ? numbered.exec(first) : null;
  const shown = match ? [(first as string).slice(match[0].length), ...parts.slice(1)] : parts;
  const medallion = match
    ? "before:content-[attr(data-number)]"
    : "before:content-[counter(section)]";

  return (
    <>
      <Star />
      <h2
        id={slugify(text(children))}
        data-number={match?.[1]}
        data-label={text(shown)}
        className={`mt-0 flex scroll-mt-20 items-baseline gap-3 [counter-increment:section] before:inline-grid before:size-[1.85rem] before:flex-none before:-translate-y-[0.15rem] before:place-items-center before:rounded-full before:border before:border-accent before:text-[0.95rem] before:font-normal before:text-accent before:outline before:outline-1 before:outline-offset-2 before:outline-accent before:[font-variant-numeric:lining-nums] ${medallion}`}
      >
        <span>{shown}</span>
      </h2>
    </>
  );
}

export const components: MDXComponents = {
  h2: H2,
  ArabicQuote,
  Callout,
  Margin,
  Mermaid,
  Quiz,
  RepoLink,
  Stepper,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
