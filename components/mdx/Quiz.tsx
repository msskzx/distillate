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
    if (i === correct) return "border-green-600 bg-green-50 dark:bg-green-950";
    if (i === picked) return "border-red-600 bg-red-50 dark:bg-red-950";
    return "";
  };

  return (
    <section className="not-prose my-8 rounded border border-stone-300 p-5 dark:border-stone-700 print:hidden">
      <h3 className="mb-2 mt-0 font-semibold">{title}</h3>
      <p className="mb-4 text-stone-700 dark:text-stone-300">{question}</p>
      <ol className="m-0 list-none space-y-2 p-0">
        {options.map((option, i) => (
          <li key={i}>
            <button
              type="button"
              disabled={picked !== undefined}
              onClick={() => setPicked(i)}
              className={`w-full rounded border border-stone-300 px-3 py-2 text-start text-sm hover:border-amber-500 disabled:cursor-default dark:border-stone-700 ${state(i)}`}
            >
              {picked !== undefined && i === correct && <span aria-label="Correct answer">✓ </span>}
              {picked !== undefined && i === picked && i !== correct && <span aria-label="Your answer, wrong">✗ </span>}
              {option}
            </button>
          </li>
        ))}
      </ol>
      {picked !== undefined && (
        <p role="status" className="mt-4 text-sm text-stone-600 dark:text-stone-400">
          {picked === correct ? right : wrong}
        </p>
      )}
    </section>
  );
}
