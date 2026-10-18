---
name: expand-contract-migration
description: Change a stored shape without breaking the running app - add a new table or field beside the old one, read both, project into it, then switch and drop the old. Use when a schema change must merge before the owner applies the migration.
---

# Expand, then contract

Never alter what a deployed reader selects. An ORM that selects every column breaks the moment a column it does not know appears, or one it knows disappears.

1. **Expand.** Add a new table (not a column on an existing one) and its migration. Keep the old shape.
2. **Tolerate absence.** The loader for the new table treats "table missing" (Prisma `P2021`) as empty and falls back to the old source, so the change can merge before the migration is applied.
3. **Project.** The projection script reports a missing table and exits non-zero under `--apply`, prints a dry run first, and never deletes live rows on invalid input.
4. **Switch.** Once the owner has applied the migration and the data is projected, read only the new shape.
5. **Contract.** In a later PR, drop the old table, column or fallback.

Say in the PR body which step this PR is and what the owner runs next.
