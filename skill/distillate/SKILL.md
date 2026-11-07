---
name: distillate
description: Capture a local Distillate record, or explicitly request a lesson or a publication batch.
---

# Distillate

Run this entry point only when the user invokes it. Distillate uses local MDX records and an append-only activity log; this workflow has no MCP dependency.

- For capture or consultation, read `~/Projects/distillate/skill/capture-record/SKILL.md`. That skill is also available for agent invocation and stops at local files.
- For a lesson, read `~/Projects/distillate/skill/write-lesson/SKILL.md` only when the user explicitly requests a lesson. A cluster of records is not permission to write one.
- For a batch PR or publication, read `~/Projects/distillate/skill/publish-distillate/SKILL.md` only when the user explicitly requests that step.

A capture request authorizes only local record/log writes. It does not authorize lessons, indexing, tests, builds, commits, pushes, PRs or MCP calls. Preserve existing pending PRs unless the user asks to change them.
