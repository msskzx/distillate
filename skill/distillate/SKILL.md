---
name: distillate
description: Capture the current solved engineering challenge as a concise Distillate review card.
---

# Capture a Distillate card

Run only when the user explicitly invokes `$distillate`.

Infer the card from the current conversation and completed work. Ask only when the challenge cannot be meaningfully reconstructed.

1. Distill one coherent challenge. Create separate cards only for genuinely independent insights.
2. Give the card a concise, specific title. State the challenge, verified solution, and why that solution was chosen.
3. Identify the project and handling agent. Include model details and exact telemetry only when exposed by the runtime. Include a task, commit, pull request, or branch reference when available.
4. Call the Distillate `capture_card` MCP tool with a stable idempotency key when the source provides one.

Keep each field concise and self-contained. Record the outcome, not the full conversation. Report a capture failure once instead of retrying it.
