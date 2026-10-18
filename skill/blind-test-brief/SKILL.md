---
name: blind-test-brief
description: Brief a small-model subagent to write tests from a spec without reading the implementation. Use before delegating test writing.
---

# Blind test brief

Tests written after reading the code assert what the code does. Write the brief so the agent asserts what the spec says.

Include, self-contained:

- the worktree path and the test stack (runner, DOM library), plus where to look for a mocking pattern to copy
- the spec as observable behaviour per function or component, with the edge cases that matter (empty, missing table, disputed, null)
- "Write tests only. Change no non-test file. Never change an expectation to make a test pass; report a failing test as a suspected defect."
- "You may read exported signatures and types to build fixtures, not the bodies."
- the runtime CI uses (check the workflow's `node-version`), so no newer built-ins such as `Map.groupBy`
- "Do not mock the unit under test or its own helpers. Mock only collaborators at the boundary (database, router, other components)."
- "Name each test for what it asserts; the name must agree with the final assertion."
- "No explanatory comments in code."
- "Run the tests, the type check and the linter on your files and report the real output."

Afterwards run lint, type check and the full suite yourself. Look for mocks that restate the implementation, names that contradict their assertions and `any` casts the linter rejects.
