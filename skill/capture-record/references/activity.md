# Append-only record activity

Append UTF-8 JSON objects, one per line, to `activity.jsonl` at the local Distillate checkout root. Create the file when the first event is needed. Never rewrite, truncate, sort or deduplicate existing lines, and never edit record metadata to store usage counters.

Each event contains:

- `date`: the actual date in `YYYY-MM-DD` form, using the session's date context.
- `record`: the exact record ID, `<project>/<filename-without-.mdx>`.
- `task`: one stable identifier for the user task, shared across its agents. Use an available task, chat or issue reference; if none is exposed, assign a local task key once. Reuse it throughout the task and distinguish separate requests in one chat. Do not invent an external reference or change the identifier merely because a PR was opened.
- `action`: `read` when the record's contents were consulted for this task, or `used` when they influenced an action.
- `effect`: required for `used`; the specific decision, check or implementation changed. Omit for `read`.

```json
{"date":"2026-11-07","record":"namaq/0021-absorbing-a-phrase-must-preserve-its-entry-points","task":"namaq/pr/524","action":"used","effect":"Added regression checks for search, subtree links and bookmarks during duplicate removal."}
```

This example is illustrative. Log actual events only; do not copy it into the log or backfill guessed reads, effects or dates. Searching, authoring, formatting or batch-publishing a record does not by itself constitute consulting it for a task. A remembered influence may be logged as `used` without fabricating a new `read` event.

Serialize each complete object with a JSON encoder, append its line in one write, and preserve existing bytes. Never insert a header or explanatory prose into JSONL. If appending fails, report it once and continue the main task rather than rewriting the file or starting a publishing workflow.

Usage summaries count distinct tasks for each `(record, action)` pair. Repeated opens in one task do not inflate the displayed Read count. Used counts documented influences, not proven savings. Last used is the latest dated `used` event. The event log is the source; a future UI can derive these values without changing the record files.

Activity may later be published with records. Apply the record's disclosure rules to the task reference and effect: omit credentials and private identifying details. For a private source, use a neutral task identifier and a generic effect.
