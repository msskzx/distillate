# Searchable record graph

Add `/records/graph`, linked from `/records`, using the shared Article shell, serif typography, shared manuscript paper/ink/accent/rule tokens and dark theme. Reuse RecordSearch and its URL filters with an optional graph rendering mode, preserving default list behavior.

## Acceptance criteria

- Every record is a selectable node, including isolated records. Positions are deterministic and do not move when searching or filtering.
- Draw only explicit buildsOn and variantOf links, with distinct solid directed and dashed undirected styling and a text legend. No inferred history.
- Existing text, topic, kind, outcome and project filters highlight matching nodes. Retain the full graph as context and distinguish nonmatches; report zero results clearly.
- Selecting a node with pointer or keyboard shows its problem, approach, outcome, conditions, evidence, relationship links and a link to its full record beside/below the graph.
- Graph fits the article; mobile permits scrolling within the graph without overflowing the page. Nodes have accessible names and keyboard focus. Light and dark themes follow the site.
- Empty index has an explicit empty state. Cycles and multiple parents must render without recursion failure or dropped nodes.

## Approach and affected paths

Use static SVG edges and HTML buttons in a scrollable canvas, with deterministic columns by project and rows by date/id. This is a relationship graph, not an inferred attempt tree. Change components/records/RecordSearch.tsx, add RecordGraph.tsx and app/records/graph/page.tsx, link from app/records/page.tsx, update README and the existing plan exclusion. No added dependencies.

Records consulted: namaq/0011-physics-on-two-chains-became-one (static SVG avoids unstable force layout); distillate/0004-the-fix-for-a-stale-search-box-wiped-what-was-typed (reuse the existing URL/input synchronization).

## Validation

DOM tests cover matches with retained context, selection/details, explicit edge kinds, isolated nodes, cycles, empty state and unchanged list mode. Run lint, typecheck, full Vitest suite and production build. Inspect browser light/dark and narrow layouts if available. Fresh independent review before opening PR. Leave PR open; do not merge.
