---
name: capture-record
description: Consult relevant Distillate records, append read/used activity, and capture a short local MDX record after a non-obvious challenge, obstacle or detour. Agents and users may invoke this; routine work needs no record.
---

# Local records and usage

Use the existing local Distillate checkout, normally `~/Projects/distillate`. Records are MDX files under `content/records/`; usage goes in the checkout's root `activity.jsonl`. Preserve existing edits and pending PRs. If the checkout is unavailable, report that once and continue the source task.

## Consult

Before a non-trivial design decision, or after an attempted fix fails, search local records with `rg`. Read relevant matches, including their outcome and conditions. A failed approach is evidence about those conditions, not a universal prohibition. Local files may include records that have not been published yet; search the MDX files rather than relying on a stale generated index.

For each record actually consulted, append a `read` event using [references/activity.md](references/activity.md). Search hits alone are not reads. Append `used` only when the record changes a concrete decision, check, implementation or investigation, with a sentence explaining the effect. Reference the influence in the task's reasoning when useful. Relevance alone is not use, and use does not prove time saved or a bug prevented.

## Capture

An agent may capture a surprising constraint, meaningful tradeoff, failed approach or reusable finding without waiting for a request. A user may request a record directly. Skip routine summaries and avoid writing multiple records about the same insight.

Write one concise local MDX file using [references/record-format.md](references/record-format.md). Include the problem, what failed or changed, the outcome, why the approach worked, and available evidence. Keep unknowns honest. Finish when the local record is written.

Capture and usage logging stop at local file writes. They do not create lessons, invoke MCP tools, regenerate indexes, run tests/builds, create worktrees, commit, push or open a PR. Leave existing PRs open. Lessons require a separate user request; batch publication requires an explicit request through `publish-distillate`.
