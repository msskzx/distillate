# Lessons are code, published by a deploy

A lesson is an MDX file in this repository, compiled into a page when the web app builds, and a merged pull request is what publishes it. We chose this over lessons stored in a database and submitted through an API, which the earlier plan `docs/plans/lesson-mcp-integration.md` proposed: an API can only render what its template already supports, while a lesson written as code can bring its own visualization or animation. Reading the pull request, or running the app locally on its branch, takes the place of the draft and review states that plan would have built.

## Consequences

- Every new lesson costs a pull request and a deploy. Lessons arrive slowly, so this is acceptable; cards, which arrive often, will not follow this path when they return.
- The repository is public, so everything committed is public. Generic disclosure is what makes it safe to commit a lesson drawn from a proprietary project.
- Phase 1 needs no database.
