---
name: write-lesson
description: Write a Distillate lesson that teaches how something works or what a cluster of records taught, from the code as it is. Use when the user asks for a lesson, or when several records on one topic point at the same idea.
---

# Write a lesson

A lesson is the owner's way into work they did not watch: they learn from it, and they review by reading it, often catching bugs and drifted requirements there rather than in the code. So a lesson states what the system actually does, precisely enough to be checked.

## Before writing

1. Read the code as it is on the commit you describe, not the plan. Where the plan and the code disagree, the code is the subject and the disagreement is a finding: put it in the lesson.
2. Search the records for the topic (`capture-record` says how) and read the hits; a lesson distilled from records cites them.
3. Read one existing lesson in the target track for its voice and components.

## What the lesson holds

- The real rules: thresholds, the order of steps, what is dropped and why, each with a `RepoLink` to the file that holds it (open disclosure).
- A worked example on real data, with the actual numbers.
- The route, where records hold it: what was tried, what failed and why.
- The commit or pull request the lesson describes, stated near the top.
- At least one `Quiz` that tests understanding of a rule, and the primary sources at the end.

Disclosure follows the same rule as records: generic when the source project is not public.

## Form

`content/lessons/<track>/NNNN-dash-case-title/index.mdx`, the next number in the track, starting with `export const meta = { title, label, summary, number, disclosure, sourceProject }`. Markdown prose with the shared components from `mdx-components.tsx` (`Callout`, `Quiz`, `Mermaid`, `ArabicQuote`, `RepoLink`, `Stepper`); a visual the shared set lacks goes in a component in the lesson's own folder. The layout supplies the style, so the lesson file carries none.

## Publish

Run `bun run lint`, `bunx tsc --noEmit`, `bunx vitest run` and `bun run build`, check the page in the browser in light and dark, and open a pull request in distillate. Merging publishes it.
