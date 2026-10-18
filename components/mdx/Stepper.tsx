"use client";

import { Children, useState, type ReactNode } from "react";
import { useReducedMotion } from "./useReducedMotion";

export function Stepper({ children }: { children: ReactNode }) {
  const steps = Children.toArray(children);
  const [shown, setShown] = useState(1);
  const reduced = useReducedMotion();
  const button =
    "rounded border border-stone-300 px-3 py-1 text-sm hover:border-amber-500 disabled:opacity-40 dark:border-stone-700";

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
