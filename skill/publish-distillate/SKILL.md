---
name: publish-distillate
description: Prepare a batch of local Distillate records and activity for a PR when the user explicitly requests publication or a batch PR.
---

# Publish a requested batch

Run only on an explicit user request to prepare a batch PR or publish selected Distillate material. Accumulated records, task completion, or invocation of capture-record do not trigger this skill. Use local files and ordinary repository tools; there is no MCP capture step.

1. Inspect the checkout and select the intended records and activity changes. Preserve unrelated work and existing PRs. Include lesson drafts only when the user includes them in the requested batch. Keep record IDs unchanged so activity references remain valid.
2. Review the selected diff for accuracy, disclosure and valid record references. Check appended activity lines are valid JSON with read/used actions and an effect for each used event. Preserve the log's existing prefix byte-for-byte. Do not fabricate or rewrite historical events while preparing the batch.
3. Regenerate `records.json` with the project's records:index command, then run the repository's required lint, type, test and build checks once for the batch. These checks belong to publication, not ordinary capture or consultation.
4. Commit and open one PR for the requested batch. Summarize its content and validation. Merge only when the user has authorized merging and required checks are green. Otherwise report the PR and stop.

An agent may suggest a batch when there is useful accumulated material, but that suggestion is not authorization to run this workflow.
