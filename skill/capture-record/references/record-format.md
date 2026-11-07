# Record file format

Write `content/records/<project>/NNNN-dash-case-title.mdx` in the existing local checkout. Use the next available number and a specific short title. Create a new file without overwriting another record. Keep its ID stable so usage events remain attached when the batch is published.

Preserve the existing MDX format: an `export const meta = { ... };` block followed by a few short paragraphs. Copy a nearby record's structure, not its facts. Supply the existing required fields: title, summary, sourceProject, kind, problem, approach, outcome, conditions, evidence, implication, date and disclosure. `kind` is challenge, obstacle or detour; `outcome` is solved, failed, partial or open. Use `implication: "none"` when no rule change follows. Optional topics use the existing list; links such as buildsOn, variantOf and lesson are included only when known.

The body states what happened, what failed or surprised us, what worked and why, with a real commit, PR, file or observed result when available. Do not manufacture citations, telemetry, certainty or a lesson link to fill a field. Recording work in progress is valid when its outcome is open or partial.

Disclosure is open only when the source project is known to be public. Otherwise use generic: a neutral project label and a description without identifying names, paths, code, private URLs or sensitive details. Local capture may later be published, so it must already respect this boundary.

Writing a record does not regenerate `records.json` or trigger any other file, validation or publication work. Batch preparation belongs to `publish-distillate` when the user requests it.
