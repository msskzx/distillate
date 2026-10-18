# Distillate

Distillate is a web app of lessons and records: what agents learned while working on the owner's projects, written so a reader can learn it too. The terms are in [CONTEXT.md](CONTEXT.md).

- A **lesson** teaches one idea at length. Lessons are grouped into **tracks**, each with its own mission.
- A **record** is a short note of one instructive event during work, with its evidence and the check that would have caught it.
- Every lesson and record has a **disclosure**: open when its source project is public, generic when it is not.

Lessons and records are MDX files under `content/`, and a merged pull request publishes them ([ADR 0001](docs/adr/0001-lessons-are-code-published-by-deploy.md)). Agents write them with the [capture-record](skill/capture-record/SKILL.md) and [write-lesson](skill/write-lesson/SKILL.md) skills.

## What is implemented

- Tracks, each with its mission, ordered lessons and workspace pages (resources, notes, reference).
- Lesson pages in one shared style, light and dark, with an index of the track and of the page's sections, and previous/next within the track.
- Records grouped by source project, each linking to the lesson it grew into. Every record states its kind (challenge, obstacle or detour), outcome, conditions and evidence, and `records.json` indexes them all for agents to search.
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

`skill/` holds the skills agents use across the owner's repositories: `capture-record`, `write-lesson`, `pr-cycle`, `review-brief`, `blind-test-brief` and `expand-contract-migration`.
