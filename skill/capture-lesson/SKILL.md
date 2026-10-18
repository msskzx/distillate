---
name: capture-lesson
description: Write a short lesson when something instructive happens during work - a bug, a wrong assumption, a funny failure, a process gap. Use during long work and at the end of a PR so the user learns and the improvement axis is recorded.
---

# Capture a lesson

One file per lesson, `docs/lessons/learning-records/NNNN-dash-case-title.md` (next number; follow the format of the existing records). If the repo has no such folder, use `docs/lessons/`.

Shape:

1. A title that states the surprise ("It worked on Node 22 and failed on CI's Node 20").
2. What happened, in a few plain sentences, with the number or error text that made it concrete. Humor is welcome when the failure was funny; never at a person's expense.
3. **Evidence:** the file, log line, commit or PR that shows it.
4. **Implications:** the rule or check that would have caught it and where it should live (a test, a lint rule, a doc, a skill). This is the improvement axis; skip the lesson if there is none.

Write for someone who was not there. Link the lesson from the PR body. When the challenge was non-trivial and reusable beyond this repo, also submit a card with the `distillate` skill.
