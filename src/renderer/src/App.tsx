import { Archive, Check, Cpu, Inbox, Pencil, RotateCcw, Save, Search, Trash2, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Card, CardStatus, UpdateCardInput } from '../../shared/cards'
import { Button } from './components/Button'
import { CardListItem } from './components/CardListItem'
import { Field, fieldClassName } from './components/Field'
import { StatusBadge } from './components/StatusBadge'

type View = 'queue' | 'reviewed'

type Draft = {
  challenge: string
  solution: string
  reasoning: string
  project: string
  agent: string
  model: string
  modelVariant: string
  reasoningEffort: string
  inputTokens: string
  outputTokens: string
  totalTokens: string
  durationMs: string
  sourceReference: string
  reviewNote: string
}

function toDraft(card: Card): Draft {
  return {
    challenge: card.challenge,
    solution: card.solution,
    reasoning: card.reasoning,
    project: card.project,
    agent: card.agent,
    model: card.model ?? '',
    modelVariant: card.modelVariant ?? '',
    reasoningEffort: card.reasoningEffort ?? '',
    inputTokens: card.inputTokens?.toString() ?? '',
    outputTokens: card.outputTokens?.toString() ?? '',
    totalTokens: card.totalTokens?.toString() ?? '',
    durationMs: card.durationMs?.toString() ?? '',
    sourceReference: card.sourceReference ?? '',
    reviewNote: card.reviewNote ?? '',
  }
}

function formatCount(value: number | null): string | null {
  return value === null ? null : value.toLocaleString()
}

function formatDuration(milliseconds: number | null): string | null {
  if (milliseconds === null) return null
  if (milliseconds < 1_000) return `${milliseconds} ms`
  if (milliseconds < 60_000) return `${(milliseconds / 1_000).toFixed(1)} s`
  return `${(milliseconds / 60_000).toFixed(1)} min`
}

function RunDetails({ card }: { card: Card }) {
  const modelIdentity = [card.model, card.modelVariant].filter(Boolean).join(' · ')
  const metrics = [
    { label: 'Total tokens', value: formatCount(card.totalTokens) },
    { label: 'Input', value: formatCount(card.inputTokens) },
    { label: 'Output', value: formatCount(card.outputTokens) },
    { label: 'Duration', value: formatDuration(card.durationMs) },
  ].filter((metric) => metric.value !== null)
  const hasDetails = Boolean(modelIdentity || card.reasoningEffort || metrics.length)

  return (
    <section aria-labelledby="run-details-heading" className="grid gap-5 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
      <div className="flex items-center gap-2 text-zinc-400">
        <Cpu size={16} />
        <h2 id="run-details-heading" className="text-xs font-semibold uppercase tracking-wide">Run details</h2>
      </div>
      {hasDetails ? (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-base font-semibold text-zinc-100">{modelIdentity || 'Model not provided'}</p>
            {card.reasoningEffort ? (
              <span className="rounded-full border border-violet-400/30 bg-violet-400/10 px-2.5 py-1 text-xs font-medium text-violet-200">
                {card.reasoningEffort} reasoning
              </span>
            ) : null}
          </div>
          {metrics.length ? (
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {metrics.map((metric) => (
                <div key={metric.label} className="rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2.5">
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-zinc-600">{metric.label}</dt>
                  <dd className="mt-1 text-sm font-semibold tabular-nums text-zinc-300">{metric.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </>
      ) : (
        <p className="text-sm text-zinc-600">No model or runtime telemetry was captured for this card.</p>
      )}
    </section>
  )
}

function ReadField({ label, value }: { label: string; value?: string | null }) {
  return (
    <section className="grid gap-2">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</h2>
      <p className={`whitespace-pre-wrap text-sm leading-6 ${value ? 'text-zinc-200' : 'text-zinc-600'}`}>
        {value || 'Not provided'}
      </p>
    </section>
  )
}

export function App() {
  const [view, setView] = useState<View>('queue')
  const [cards, setCards] = useState<Card[]>([])
  const [projects, setProjects] = useState<string[]>([])
  const [query, setQuery] = useState('')
  const [project, setProject] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedCard = useMemo(() => cards.find((card) => card.id === selectedId) ?? null, [cards, selectedId])

  const load = useCallback(async () => {
    try {
      const api = window.distillate
      if (!api?.cards) {
        throw new Error('The Distillate desktop bridge is unavailable. Restart the application.')
      }
      const statuses: CardStatus[] = view === 'queue' ? ['unreviewed', 'revisit'] : ['reviewed']
      const [nextCards, nextProjects] = await Promise.all([
        api.cards.list({ statuses, project: project || undefined, query: query || undefined }),
        api.cards.projects(),
      ])
      setCards(nextCards)
      setProjects(nextProjects)
      setSelectedId((current) => (current && nextCards.some((card) => card.id === current) ? current : nextCards[0]?.id ?? null))
      setError(null)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to load cards')
    } finally {
      setLoading(false)
    }
  }, [project, query, view])

  useEffect(() => {
    setLoading(true)
    void load()
  }, [load])

  useEffect(() => {
    const refresh = () => void load()
    const timer = window.setInterval(refresh, 5_000)
    window.addEventListener('focus', refresh)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('focus', refresh)
    }
  }, [load])

  useEffect(() => {
    setDraft(selectedCard ? toDraft(selectedCard) : null)
  }, [selectedCard])

  useEffect(() => {
    setEditing(false)
  }, [selectedId])

  const updateDraft = <K extends keyof Draft>(field: K, value: Draft[K]) => {
    setDraft((current) => (current ? { ...current, [field]: value } : current))
  }

  const save = async () => {
    if (!selectedCard || !draft) return
    setSaving(true)
    try {
      const changes: UpdateCardInput = {
        ...draft,
        model: draft.model || null,
        modelVariant: draft.modelVariant || null,
        reasoningEffort: draft.reasoningEffort || null,
        inputTokens: draft.inputTokens ? Number(draft.inputTokens) : null,
        outputTokens: draft.outputTokens ? Number(draft.outputTokens) : null,
        totalTokens: draft.totalTokens ? Number(draft.totalTokens) : null,
        durationMs: draft.durationMs ? Number(draft.durationMs) : null,
        sourceReference: draft.sourceReference || null,
        reviewNote: draft.reviewNote || null,
      }
      await window.distillate.cards.update(selectedCard.id, changes)
      await load()
      setEditing(false)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to save the card')
    } finally {
      setSaving(false)
    }
  }

  const changeStatus = async (status: CardStatus) => {
    if (!selectedCard) return
    setSaving(true)
    try {
      await window.distillate.cards.setStatus(selectedCard.id, status)
      await load()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to change card status')
    } finally {
      setSaving(false)
    }
  }

  const deleteCard = async () => {
    if (!selectedCard || !window.confirm('Delete this Distillate card? This cannot be undone.')) return
    setSaving(true)
    try {
      await window.distillate.cards.delete(selectedCard.id)
      await load()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to delete the card')
    } finally {
      setSaving(false)
    }
  }

  const cancelEditing = () => {
    setDraft(selectedCard ? toDraft(selectedCard) : null)
    setEditing(false)
  }

  return (
    <main className="grid h-full grid-rows-[auto_1fr] bg-zinc-950 text-zinc-100">
      <header className="flex min-h-16 items-center justify-between gap-6 border-b border-zinc-800 px-5">
        <div className="flex items-center gap-3">
          <img src="./icon.png" alt="" aria-hidden="true" className="size-10 rounded-xl shadow-lg shadow-black/30" />
          <div>
            <h1 className="text-lg font-bold tracking-tight">Distillate</h1>
            <p className="text-xs text-zinc-500">Solved challenges, ready when you are.</p>
          </div>
        </div>
        <nav aria-label="Card views" className="flex rounded-lg border border-zinc-800 bg-zinc-900 p-1">
          <button
            type="button"
            onClick={() => setView('queue')}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              view === 'queue' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Inbox size={15} /> Queue
          </button>
          <button
            type="button"
            onClick={() => setView('reviewed')}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              view === 'reviewed' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Archive size={15} /> Reviewed
          </button>
        </nav>
      </header>

      <section className="grid min-h-0 grid-cols-[360px_minmax(0,1fr)]">
        <aside className="grid min-h-0 grid-rows-[auto_1fr] border-r border-zinc-800 bg-zinc-950">
          <div className="grid gap-3 border-b border-zinc-800 p-4">
            <label className="relative">
              <span className="sr-only">Search cards</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search cards"
                className={`${fieldClassName} pl-9`}
              />
            </label>
            <select
              aria-label="Filter by project"
              value={project}
              onChange={(event) => setProject(event.target.value)}
              className={fieldClassName}
            >
              <option value="">All projects</option>
              {projects.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="min-h-0 overflow-y-auto" aria-live="polite">
            {loading ? <p className="p-5 text-sm text-zinc-500">Loading cards…</p> : null}
            {!loading && cards.length === 0 ? (
              <div className="grid justify-items-center gap-2 px-8 py-16 text-center">
                <Inbox className="text-zinc-700" size={28} />
                <p className="text-sm font-medium text-zinc-400">No cards here</p>
                <p className="text-xs leading-5 text-zinc-600">
                  {view === 'queue' ? 'New agent captures will appear in this queue.' : 'Reviewed cards will collect here.'}
                </p>
              </div>
            ) : null}
            {cards.map((card) => (
              <CardListItem key={card.id} card={card} selected={card.id === selectedId} onSelect={() => setSelectedId(card.id)} />
            ))}
          </div>
        </aside>

        <article className="min-h-0 overflow-y-auto">
          {error ? (
            <div role="alert" className="m-5 rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          {!selectedCard || !draft ? (
            <div className="grid h-full place-items-center p-8 text-sm text-zinc-600">Select a card to review it.</div>
          ) : (
            <div className="mx-auto grid max-w-3xl gap-7 p-8">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-5">
                <div className="flex items-center gap-3">
                  <StatusBadge status={selectedCard.status} />
                  <span className="text-xs text-zinc-600">Updated {new Date(selectedCard.updatedAt).toLocaleString()}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!editing ? (
                    <>
                      <Button onClick={() => setEditing(true)} disabled={saving}>
                        <Pencil size={15} /> Edit
                      </Button>
                      {selectedCard.status !== 'reviewed' ? (
                        <Button onClick={() => void changeStatus('reviewed')} disabled={saving}>
                          <Check size={15} /> Mark reviewed
                        </Button>
                      ) : (
                        <Button onClick={() => void changeStatus('unreviewed')} disabled={saving}>
                          <RotateCcw size={15} /> Return to queue
                        </Button>
                      )}
                      {selectedCard.status !== 'revisit' ? (
                        <Button onClick={() => void changeStatus('revisit')} disabled={saving}>
                          <RotateCcw size={15} /> Revisit
                        </Button>
                      ) : null}
                    </>
                  ) : null}
                </div>
              </div>

              {editing ? (
                <form
                  className="grid gap-7"
                  onSubmit={(event) => {
                    event.preventDefault()
                    void save()
                  }}
                >
              <Field label="Challenge" htmlFor="challenge">
                <textarea
                  id="challenge"
                  required
                  rows={4}
                  value={draft.challenge}
                  onChange={(event) => updateDraft('challenge', event.target.value)}
                  className={`${fieldClassName} resize-y leading-6`}
                />
              </Field>
              <Field label="Solution" htmlFor="solution">
                <textarea
                  id="solution"
                  required
                  rows={5}
                  value={draft.solution}
                  onChange={(event) => updateDraft('solution', event.target.value)}
                  className={`${fieldClassName} resize-y leading-6`}
                />
              </Field>
              <Field label="Reasoning" htmlFor="reasoning">
                <textarea
                  id="reasoning"
                  required
                  rows={5}
                  value={draft.reasoning}
                  onChange={(event) => updateDraft('reasoning', event.target.value)}
                  className={`${fieldClassName} resize-y leading-6`}
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Project" htmlFor="project-name">
                  <input
                    id="project-name"
                    required
                    value={draft.project}
                    onChange={(event) => updateDraft('project', event.target.value)}
                    className={fieldClassName}
                  />
                </Field>
                <Field label="Agent" htmlFor="agent">
                  <input
                    id="agent"
                    required
                    value={draft.agent}
                    onChange={(event) => updateDraft('agent', event.target.value)}
                    className={fieldClassName}
                  />
                </Field>
              </div>

              <section className="grid gap-5 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Cpu size={16} />
                    <h2 className="text-xs font-semibold uppercase tracking-wide">Run details</h2>
                  </div>
                  <p className="text-xs text-zinc-600">Optional · use runtime-reported values only</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                <Field label="Model" htmlFor="model">
                  <input
                    id="model"
                    value={draft.model}
                    onChange={(event) => updateDraft('model', event.target.value)}
                    placeholder="GPT-5.6"
                    className={fieldClassName}
                  />
                </Field>
                <Field label="Variant" htmlFor="model-variant">
                  <input
                    id="model-variant"
                    value={draft.modelVariant}
                    onChange={(event) => updateDraft('modelVariant', event.target.value)}
                    placeholder="sol"
                    className={fieldClassName}
                  />
                </Field>
                <Field label="Reasoning effort" htmlFor="reasoning-effort">
                  <input
                    id="reasoning-effort"
                    value={draft.reasoningEffort}
                    onChange={(event) => updateDraft('reasoningEffort', event.target.value)}
                    placeholder="medium"
                    className={fieldClassName}
                  />
                </Field>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-zinc-800 pt-5 sm:grid-cols-4">
                <Field label="Input tokens" htmlFor="input-tokens">
                  <input id="input-tokens" type="number" min="0" step="1" value={draft.inputTokens} onChange={(event) => updateDraft('inputTokens', event.target.value)} className={fieldClassName} />
                </Field>
                <Field label="Output tokens" htmlFor="output-tokens">
                  <input id="output-tokens" type="number" min="0" step="1" value={draft.outputTokens} onChange={(event) => updateDraft('outputTokens', event.target.value)} className={fieldClassName} />
                </Field>
                <Field label="Total tokens" htmlFor="total-tokens">
                  <input id="total-tokens" type="number" min="0" step="1" value={draft.totalTokens} onChange={(event) => updateDraft('totalTokens', event.target.value)} className={fieldClassName} />
                </Field>
                <Field label="Duration (ms)" htmlFor="duration-ms">
                  <input id="duration-ms" type="number" min="0" step="1" value={draft.durationMs} onChange={(event) => updateDraft('durationMs', event.target.value)} className={fieldClassName} />
                </Field>
                </div>
              </section>

              <Field label="Source reference" htmlFor="source-reference" hint="Optional">
                <input
                  id="source-reference"
                  value={draft.sourceReference}
                  onChange={(event) => updateDraft('sourceReference', event.target.value)}
                  placeholder="Task, commit, PR, or branch"
                  className={fieldClassName}
                />
              </Field>

              <Field label="Review note" htmlFor="review-note" hint="Optional">
                <textarea
                  id="review-note"
                  rows={4}
                  value={draft.reviewNote}
                  onChange={(event) => updateDraft('reviewNote', event.target.value)}
                  placeholder="What should be reconsidered or followed up?"
                  className={`${fieldClassName} resize-y leading-6`}
                />
              </Field>

              <div className="flex items-center justify-between border-t border-zinc-800 pt-5">
                <Button variant="danger" onClick={() => void deleteCard()} disabled={saving}>
                  <Trash2 size={15} /> Delete
                </Button>
                <div className="flex gap-2">
                  <Button onClick={cancelEditing} disabled={saving}>
                    <X size={15} /> Cancel
                  </Button>
                  <Button variant="primary" type="submit" disabled={saving}>
                    <Save size={15} /> {saving ? 'Saving…' : 'Save changes'}
                  </Button>
                </div>
              </div>
                </form>
              ) : (
                <div className="grid gap-7">
                  <ReadField label="Challenge" value={selectedCard.challenge} />
                  <ReadField label="Solution" value={selectedCard.solution} />
                  <ReadField label="Reasoning" value={selectedCard.reasoning} />
                  <div className="grid grid-cols-2 gap-4">
                    <ReadField label="Project" value={selectedCard.project} />
                    <ReadField label="Agent" value={selectedCard.agent} />
                  </div>
                  <RunDetails card={selectedCard} />
                  <ReadField label="Source reference" value={selectedCard.sourceReference} />
                  <ReadField label="Review note" value={selectedCard.reviewNote} />
                </div>
              )}
            </div>
          )}
        </article>
      </section>
    </main>
  )
}
