---
name: capture-record
description: Search Distillate records before designing a change and after a first fix fails; write a record when a challenge, obstacle or detour happens during work. Records go to github.com/msskzx/distillate through one pull request per session.
---

# Records: search first, record at the moment

Distillate holds records of past work across the owner's projects so a problem met once is not paid for twice. Terms (record, kind, outcome, conditions, topic, disclosure) are defined in distillate's `CONTEXT.md`.

## Search

Search at two moments:

- **Before designing** a non-trivial change: search for the problem and its topics.
- **When stuck**: after the first fix for a problem fails, search before trying a second. The error text, the library and the symptom make good queries.

```bash
curl -s "https://distillate-kappa.vercel.app/api/records?q=<words>&topic=<topic>"
```

`kind`, `outcome` and `project` filter too. If the site is down, read `https://raw.githubusercontent.com/msskzx/distillate/main/records.json`.

Read each hit's `outcome` and `conditions` before using it. A `failed` record says the approach failed under those conditions; when yours differ, say how and try it. In the plan or the reply, name the records that applied and what you took from them, or say that the search found none.

## Record

Record the moment one of these happens, while the route is still visible, not at the end when the final code has hidden it:

- **challenge**: the problem the work exists to solve, and how it was approached.
- **obstacle**: a constraint discovered while implementing that shaped the solution.
- **detour**: something tried that broke and was then fixed.

Record what a skilled engineer would want to know before meeting the same problem: a surprising constraint, a non-obvious failure, a trade-off that decided the design. Routine work, typos and first-try fixes stay out.

Keep a draft list during the session; publish it once at the end of the session, or when the user asks.

### Disclosure

Decide first.

- **open** when the source project's repository is public (`gh repo view --json visibility`): name files, pull requests, figures and code freely, and link files with `<RepoLink repo="<repo>" path="<path>" />`.
- **generic** in every other case, including when you cannot tell. Tell the problem and the idea of the solution the way a candidate describes past work in an interview: no project, client or people names, no paths, no code, no figures. The project folder and `sourceProject` are a neutral name you choose (`client-work`). "A batch import silently dropped rows when a column was added" is generic; "`importBatch.ts` dropped 312 rows in namaq" is not.

Distillate's site is public and deploys on merge, so a merged record is published.

### Fields

A record is `content/records/<project>/NNNN-dash-case-title.mdx` (the next number in that folder). Copy the `meta` block of a recent record and fill every field:

| Field | What it holds |
| --- | --- |
| `title` | the surprise or the problem, in a sentence |
| `summary` | one sentence for listings |
| `kind` | `challenge`, `obstacle` or `detour` |
| `problem` | one sentence phrased so the same problem in another project would match a search |
| `approach` | what was tried, ending with what held |
| `outcome` | `solved`, `failed` (with the reason in the body), `partial` or `open` |
| `conditions` | what was true when it was tried: versions, data size, setup, constraints |
| `evidence` | commit, PR, log line or file |
| `implication` | the rule, check or skill that should change, or `none` |
| `date` | the day it happened, `YYYY-MM-DD` |
| `disclosure`, `sourceProject` | as above |
| `topics` | from `content/topics.json`; add a topic there when none fits |
| `buildsOn`, `variantOf` | ids (`<project>/<file name without .mdx>`) of records it continues or repeats |

The body tells the story in a few plain sentences: what happened, with the number or error text that made it concrete, then **Evidence** and **Implications** paragraphs. Write for someone who was not there. Humor is welcome when the failure was funny, never at a person's expense.

### Publish

1. In a distillate worktree on a `claude/records-<topic>` branch, add the session's records.
2. Run `bun run records:index`, then `bun run lint`, `bunx tsc --noEmit`, `bunx vitest run` and `bun run build`.
3. Open one pull request for the session, and link it from the pull request of the work the records came from.

When an implication names a skill or rule in this repository, change it in the same pull request or say in the body which follow-up will.
