"use client";

import { useState } from "react";

export function Quiz({
  title = "Retrieval",
  question,
  options,
  answer,
  right,
  wrong,
}: {
  title?: string;
  question: string;
  options: string[];
  answer: number;
  right: string;
  wrong: string;
}) {
  const [picked, setPicked] = useState<number>();
  const correct = answer - 1;
  const state = (i: number) => {
    if (picked === undefined) return "";
    if (i === correct) return "border-green-700 text-green-800 dark:border-green-400 dark:text-green-300";
    if (i === picked) return "border-red-700 text-red-800 dark:border-red-400 dark:text-red-300";
    return "";
  };

  return (
    <section className="not-prose my-8 border-y border-rule py-5 print:hidden">
      <h3 className="mb-2 mt-0 text-lg font-normal tracking-[0.1em] text-accent [font-variant:all-small-caps]">{title}</h3>
      <p className="mb-4 mt-0">{question}</p>
      <ol className="m-0 list-none space-y-2 p-0">
        {options.map((option, i) => (
          <li key={i}>
            <button
              type="button"
              disabled={picked !== undefined}
              onClick={() => setPicked(i)}
              className={`w-full rounded-sm border border-rule bg-transparent px-3 py-2 text-start text-base text-ink hover:border-accent disabled:cursor-default disabled:hover:border-rule ${state(i)}`}
            >
              {picked !== undefined && i === correct && (
                <>
                  <span aria-hidden="true">✓ </span>
                  <span className="sr-only">Correct answer: </span>
                </>
              )}
              {picked !== undefined && i === picked && i !== correct && (
                <>
                  <span aria-hidden="true">✗ </span>
                  <span className="sr-only">Your answer, wrong: </span>
                </>
              )}
              {option}
            </button>
          </li>
        ))}
      </ol>
      {picked !== undefined && (
        <p role="status" className="mb-0 mt-4 text-base italic text-ink-soft">
          {picked === correct ? right : wrong}
        </p>
      )}
    </section>
  );
}
