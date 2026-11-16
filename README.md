# Distillate

Distillate is a web app of lessons and records: what agents learned while working on the owner's projects, written so a reader can learn it too. The terms are in [CONTEXT.md](CONTEXT.md).

- A **lesson** teaches one idea at length. Lessons are grouped into **tracks**, each with its own mission.
- A **record** is a short note of one instructive event during work, with its evidence and the check that would have caught it. Its id is `R` and a number, such as `R0019`, so it is never mistaken for an ADR or PR number.
- Every lesson and record has a **disclosure**: open when its source project is public, generic when it is not.

Lessons and records are MDX files under `content/`, and a merged pull request publishes them ([ADR 0001](docs/adr/0001-lessons-are-code-published-by-deploy.md)). Agents or users capture short local MDX records with [capture-record](skill/capture-record/SKILL.md). Record reads and documented influences are appended to `activity.jsonl`; record files do not hold usage counters. Lessons are [user-requested drafts](skill/write-lesson/SKILL.md). Capture stops at file writes. Indexing, checks and PRs belong to an explicit [publication batch](skill/publish-distillate/SKILL.md), not each record. This file workflow does not use MCP.

## What is implemented

- Tracks, each with its mission, ordered lessons and workspace pages (resources, notes, reference).
- Lesson pages in one shared style, light and dark, with an index of the track and of the page's sections, and previous/next within the track.
- Records grouped by source project, each linking to the lesson it grew into. Every record states its kind (challenge, obstacle or detour), outcome, conditions and evidence, and `records.json` indexes them all for agents to search.
- A record stats page (`/records/stats`): records by project, added and used by month, most used, never used, how many list their failed attempts under `## Tried`, and names that could not be counted. Each record page shows its own use: how often, the first and last PR that used it, the PR that added it and its source file. The counts come from `content/usage/<project>.json`, which the source project's export writes from the `Records used:` line of its merged PRs (namaq: `npm run records:export`), and are worked out when the site builds.
- Namaq's records are written in namaq's `docs/records` and copied here by that same export, so edit them there.
- A records search page that filters by text, topic, kind, outcome and project, and a `GET /api/records` endpoint that answers the same queries for agents. The linked `/records/graph` page highlights those matches in a stable graph of explicit “builds on” and “variant of” relationships, with selectable record details.
- Shared lesson components: quizzes, callouts, Mermaid diagrams, Arabic quotations, links into other repositories, and step-by-step reveals that respect reduced motion.

Cards, the MCP capture server and the desktop app are paused; see [the plan](docs/plans/lessons-web-app.md).

## Development

Requirements: Bun 1.3 or newer.

```bash
bun install
bun run dev
```

The app runs at http://localhost:4000.

Checks to run before a pull request:

```bash
bun run lint
bunx tsc --noEmit
bunx vitest run
bun run build
```

## Skills

`skill/` holds the skills agents use across the owner's repositories: `capture-record`, `write-lesson`, `publish-distillate`, `pr-cycle`, `review-brief`, `blind-test-brief` and `expand-contract-migration`.

## Brand assets

`components/Logo.tsx` contains the transparent branching mark as SVG paths. It follows the page theme through the shared ink and accent variables. Run `bun run brand:assets` to regenerate the light/dark SVGs and transparent PNGs in `public/brand/`, the compatibility `public/logo.png`, adaptive SVG favicon, 16/32/48-pixel ICO, and 180-pixel Apple icon. The favicon follows the browser color scheme; the on-page mark follows the app theme.
