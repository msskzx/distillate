# Transparent branching mark and wider pages

Replace the previous bitmap logo with a vector recreation of the approved asymmetrical branching mark and rust drop, without a wordmark. Use existing manuscript colors. SVG assets have no background; light and dark variants share geometry. Browser favicon adapts through prefers-color-scheme. Supply transparent PNG exports at 512 and 192 pixels and Apple touch icon at 180 pixels; favicon ICO contains 16/32/48 pixel images. On-page logo follows the app's explicit dark class, independently of OS theme.

Widen reading pages and home while preserving the manuscript layout and margin notes. The graph page uses most available viewport width with no unused margin-note gutter. With the contents drawer open, desktop content must not overlap it; on mobile the graph scrolls internally and page remains within viewport.

Affected: components/lesson/Article.tsx, app/globals.css, app/page.tsx, components/lesson/Chrome.tsx, app/loading.tsx, app/records/graph/page.tsx, new Logo component, public/brand assets, favicon files and regeneration script.

Validation: lint, typecheck, full tests and build; inspect desktop and mobile home, lesson with margin notes, graph and both themes; verify SVG background absence and PNG alpha, inspect 16/32 pixel favicon previews. Fresh review. Create follow-up PR and leave it open.

Records consulted: the existing static-graph/URL synchronization records remain applicable through reused graph code. No new search behavior is added.
