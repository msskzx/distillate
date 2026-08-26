---
name: capture-card
description: Capture a concise Distillate review card after an agent solves and verifies a non-trivial engineering challenge, or whenever the user explicitly asks to capture the current challenge. Do not use for routine implementation work.
---

# Capture a Distillate card

Preserve the essence of a solved engineering challenge without turning it into project documentation.

## Decide whether to capture

Capture automatically after completing and verifying work when the challenge involved a meaningful tradeoff, surprising constraint, non-obvious failure, or reusable engineering insight. Do not interrupt development or request review first. Skip routine implementation, formatting, dependency maintenance, and obvious fixes.

When the user explicitly invokes `$capture-card`, capture from the current task even if you would not have selected it automatically. Infer the fields from the conversation and completed work. Ask only when the card cannot be meaningfully reconstructed.

## Submit

After the solution is verified and before sending the final task response:

1. Distill one coherent challenge. Create separate cards only for genuinely independent insights.
2. Give the card a concise, specific title; this field is required. State what made the challenge non-trivial, the verified solution, and why that solution was chosen.
3. Identify the repository or project and handling agent. Copy the model family, model variant, and reasoning effort when they are explicitly present in the session configuration or runtime context. Include input/output/total tokens and task duration only when exact counters are exposed by the runtime. Never infer, guess, or estimate missing telemetry. Include a task, commit, pull request, or branch reference when available.
4. Call the Distillate `capture_card` MCP tool. Use a stable idempotency key when the source provides one.

Keep each narrative field concise and self-contained. Record the outcome, not the full conversation. A capture failure does not invalidate completed project work; mention the failure briefly in the final response instead of repeatedly retrying.
