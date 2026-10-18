---
name: pr-cycle
description: Deliver a change end to end with fresh subagents - implement, blind tests, review, PR, merge, clean up. Use when the user says to plan, implement, test, open and merge a PR, or asks for work "to be done".
---

# PR cycle

An open PR means the work is finished. Run the phases in order and keep each subagent's context to what it needs: a brief that points at the plan or spec file rather than repeating the conversation.

1. **Plan.** The plan lives in a file (`docs/plans/<topic>.md`) with acceptance criteria, affected paths and validation. Without one, write it first.
2. **Worktree.** Branch `<agent>/<name>` (no digits) in the repo's worktree root, `.env` and `node_modules` symlinked from the main checkout.
3. **Implement.** Brief a fresh implementer from the plan file and name the files it owns, when the plan has acceptance criteria and the work needs no back-and-forth with the user. Do it yourself when the work depends on the user's live feedback (visual tuning) or is a few lines.
4. **Tests.** Brief a small-model agent with `blind-test-brief`, in parallel with the implementer when the logic is new, so the tests come from the spec and never from the code.
5. **Check yourself.** Run lint, type check and the full test suite. Never take a subagent's "all green" as the result; they have reported green while lint and tests failed.
6. **Review.** Brief a fresh reviewer with `review-brief`; the reviewer is never the author of the code or tests. One cycle. A second only if the first needed a code or test change. Never a third.
7. **PR.** The summary says what and why; a Review section lists findings and what was done with each; end with Next steps so another agent can resume. Commit messages are Conventional Commits.
8. **Merge.** After CI is green, merge by hand (`gh pr merge --squash`) unless the repo allows auto-merge. A migration the owner applies never blocks the merge; write the change so the app works before it (`expand-contract-migration`).
9. **Clean up.** Delete the remote and local branch and remove the worktree. Then tell the user it is a good moment to `/compact`.
10. **Lesson.** Run `capture-lesson` when something went wrong in an instructive way.
