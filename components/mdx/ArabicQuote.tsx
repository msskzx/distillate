import type { ReactNode } from "react";

export function ArabicQuote({ children }: { children: ReactNode }) {
  return (
    <blockquote
      dir="rtl"
      lang="ar"
      className="not-prose my-6 border-s-2 border-accent ps-4 font-arabic text-[1.3rem] leading-[2.1]"
    >
      {children}
    </blockquote>
  );
}
