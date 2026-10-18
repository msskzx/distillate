import type { ReactNode } from "react";

export function ArabicQuote({ children }: { children: ReactNode }) {
  return (
    <blockquote
      dir="rtl"
      lang="ar"
      className="not-prose my-6 border-s-4 border-amber-600 ps-4 font-[Amiri,'Noto_Naskh_Arabic',serif] text-xl leading-loose"
    >
      {children}
    </blockquote>
  );
}
