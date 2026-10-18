"use client";

import { Children, useState, type ReactNode } from "react";
import { useReducedMotion } from "./useReducedMotion";

export function Stepper({ children }: { children: ReactNode }) {
  const steps = Children.toArray(children);
  const [shown, setShown] = useState(1);
  const reduced = useReducedMotion();
  const button =
    "rounded-sm border border-rule bg-transparent px-3 py-0.5 text-base text-ink-soft hover:border-accent hover:text-accent disabled:opacity-40 disabled:hover:border-rule disabled:hover:text-ink-soft";

  return (
    <div className="my-8">
      {steps.slice(0, shown).map((step, i) => (
        <div key={i} className={reduced ? "" : "animate-[fade-in_300ms_ease-out]"}>
          {step}
        </div>
      ))}
      <div className="not-prose mt-4 flex gap-2">
        <button type="button" className={button} disabled={shown === 1} onClick={() => setShown(shown - 1)}>
          Back
        </button>
        <button type="button" className={button} disabled={shown === steps.length} onClick={() => setShown(shown + 1)}>
          Next step ({shown}/{steps.length})
        </button>
      </div>
    </div>
  );
}
