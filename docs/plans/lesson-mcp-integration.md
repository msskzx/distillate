# Lesson MCP integration

## Decision

Agents submit structured JSON lesson data. Distillate validates that data and generates the standalone HTML lesson pages.

Agents do not submit raw HTML as the primary format.

## Why JSON

- Validate the lesson shape with Zod.
- Keep banners, quizzes, references, and navigation consistent.
- Escape or safely render lesson text.
- Redesign the shared HTML template without rewriting lessons.
- Export the same lesson to HTML, Markdown, slides, or PDF later.
- Update individual sections without parsing arbitrary markup.

Text fields may support limited Markdown in a later iteration, but rendering remains controlled by Distillate.

## Workflow

```text
Agent
  -> create_lesson_draft (MCP)
  -> Distillate lesson store
  -> Learn view preview and review
  -> publish_lesson (explicit approval)
  -> lessons/<slug>.html
```

Drafting and publishing are separate operations. An agent may create or update a draft, but publishing requires explicit approval.

## Lesson states

- `draft` — created or edited by an agent; not ready for readers.
- `reviewed` — checked by a human; eligible for publishing.
- `published` — rendered as a standalone lesson page.
- `archived` — retained but hidden from the curriculum.

## Initial MCP surface

Implement the smallest useful set first:

- `create_lesson_draft`
- `list_lessons`
- `get_lesson`

Add later:

- `update_lesson`
- `publish_lesson`
- `archive_lesson`
- `draft_lesson_from_solution` MCP prompt

The MCP tool description should tell agents to use lessons for reusable concepts, keep one practical win per lesson, include examples and verification, and create drafts rather than publish directly.

## Proposed input shape

```ts
type LessonDraftInput = {
  title: string
  slug?: string
  summary: string
  audience: string
  takeaway: string
  sections: Array<{
    heading: string
    body: string
    bullets?: string[]
  }>
  banner?: {
    label: string
    text: string
    tone: 'info' | 'warning' | 'success'
  }
  quiz?: Array<{
    question: string
    options: string[]
    answer: number
    explanation: string
  }>
  exercise?: {
    prompt: string
    expectedOutcome: string
  }
  references?: Array<{
    title: string
    url: string
  }>
  sourceReference?: string
  agent: string
}
```

## Storage and rendering

Store the structured lesson data in SQLite, parallel to Distillate cards. Generate standalone pages from one shared lesson template and shared assets for:

- black background and white text;
- hidable lesson sidebar;
- banners and callouts;
- quizzes and answer explanations;
- references;
- previous/next navigation.

The Learn view should act as the curriculum launcher and preview surface. Lesson prose should live in the generated standalone HTML assets rather than in the React component.

## Boundaries

- Never allow an MCP lesson tool to write arbitrary filesystem paths.
- Validate title, slug, lengths, quiz answers, and reference URLs.
- Escape lesson text during rendering.
- Keep publishing explicit and auditable.
- Do not add slide generation, version branching, or a rich lesson editor until the draft/review flow is proven.
