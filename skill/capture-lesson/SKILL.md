---
name: capture-lesson
description: Write a record when something instructive happens during work - a bug, a wrong assumption, a funny failure, a process gap - and a lesson when the idea deserves a long form. Both go to the distillate repository through a pull request. Use during long work and at the end of a PR so the user learns and the improvement axis is recorded.
---

# Capture a record or a lesson

Records and lessons live in the distillate repository (`github.com/msskzx/distillate`), not in the repository you are working in. Terms are defined in its `CONTEXT.md`.

## Record or lesson

- A **record** is short: one instructive event. Write one whenever something goes wrong in an instructive way.
- A **lesson** teaches one idea at length, with prose and whatever visuals the idea needs. Write one only when the user asks, or when several records point at the same idea.

## Disclosure

Decide before writing a word.

- **open** when the source project's repository is public (`gh repo view --json visibility`). Name files, pull requests, figures and code freely.
- **generic** in every other case, including when you cannot tell. Tell the problem and the idea of the solution the way a candidate describes past work in an interview: no project or client names, no paths, no code, no figures, no names of people, nothing a reader could trace to the project. "A batch import silently dropped rows when a column was added" is generic; "`importBatch.ts` dropped 312 rows in namaq" is not.

The distillate repository is public, so a generic item that leaks a detail has published it.

## Where it goes

Work in a checkout of distillate on its own branch, following its worktree rules.

- Record: `content/records/<source-project>/NNNN-dash-case-title.mdx`, the next number in that folder. For a generic record, `<source-project>` is a neutral name you choose (`client-work`), never the real one.
- Lesson: `content/lessons/<track>/NNNN-dash-case-title/index.mdx`, the next number in the track. Components it alone needs go in the same folder.

Both start with `export const meta = { ... }`; copy the fields from an existing file of the same kind. `bunx vitest run` checks them.

## A record's shape

1. A title that states the surprise ("It worked on Node 22 and failed on CI's Node 20").
2. What happened, in a few plain sentences, with the number or error text that made it concrete (open) or the kind of failure (generic). Humor is welcome when the failure was funny; never at a person's expense.
3. **Evidence:** the file, log line, commit or PR that shows it. For a generic record, describe the kind of evidence instead.
4. **Implications:** the rule or check that would have caught it and where it should live (a test, a lint rule, a doc, a skill). This is the improvement axis; skip the record if there is none.

Write for someone who was not there.

## A lesson's shape

Markdown prose, using the shared components from `mdx-components.tsx` (`Callout`, `Quiz`, `Mermaid`, `ArabicQuote`, `RepoLink`, `Stepper`) and no styling of its own. End with at least one `Quiz` and the primary sources. Look at an existing lesson in the same track before starting.

## Publish

Open a pull request in distillate with the record or lesson, run `bun run lint`, `bunx tsc --noEmit`, `bunx vitest run` and `bun run build` first, and link that pull request from the pull request of the work it came from. Merging publishes it.
