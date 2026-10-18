import type { MDXComponents } from "mdx/types";
import { Children, isValidElement, type ReactNode } from "react";
import { ArabicQuote } from "@/components/mdx/ArabicQuote";
import { Callout } from "@/components/mdx/Callout";
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

export const components: MDXComponents = {
  h2: ({ children }) => <h2 id={slugify(text(children))}>{children}</h2>,
  ArabicQuote,
  Callout,
  Mermaid,
  Quiz,
  RepoLink,
  Stepper,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
