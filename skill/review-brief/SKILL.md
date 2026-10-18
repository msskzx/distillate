---
name: review-brief
description: Brief a fresh subagent to review a diff for real defects before a PR. Use for the pre-PR review cycle; a different agent from the author.
---

# Review brief

Give the reviewer the branch, the base, the spec file and the rules that apply (CI runtime, comment policy), and ask for real defects only, each with `file:line` and a concrete failing scenario, ranked, under 400 words. "No defects" is a valid answer. The reviewer changes no files.

For a second cycle, list the first cycle's findings and ask whether the fixes are correct and complete, and for new defects only.

Point the reviewer at the defect classes that reviews found in practice:

- **Fail-open parsing**: a reader that guesses when it should refuse; a check that an exempt case bypasses.
- **Data silently dropped**: a missing page, table or file that yields an empty result with no error.
- **Wrong scope**: only the first citation or case checked; a delete or update that touches live rows on invalid input.
- **Exit codes**: a command that reports a problem but exits zero.
- **Runtime drift**: built-ins newer than the CI Node version.
- **Weak tests**: a test that mocks its own unit, an expectation restated from the code, a name that contradicts its assertion, an assertion that cannot fail.
- **Stale derived data**: a stored view or projection that goes out of date when its builder changes.
- **Bilingual and theme gaps** in UI: missing Arabic text, no dark variant, direction-sensitive icons.

Answer every finding: fix it, or reply in the PR body with the reason it stands. A reviewer who hedges on a detail ("fine on Node 22") is naming the command to run next.
