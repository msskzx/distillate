import { afterEach, describe, expect, test } from 'bun:test'
import { mkdtempSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { CardStore } from '../src/core/card-store'
import { openBunDatabase } from '../src/core/database-bun'

const stores: CardStore[] = []
const directories: string[] = []

function createStore() {
  const directory = mkdtempSync(join(tmpdir(), 'distillate-card-store-'))
  directories.push(directory)
  const path = join(directory, 'test.sqlite')
  const store = new CardStore(openBunDatabase(path))
  stores.push(store)
  return { store, path }
}

const input = {
  title: 'Share persisted cards safely across processes',
  challenge: 'The renderer and MCP process needed to share persisted cards.',
  solution: 'Both processes use the same SQLite database with WAL enabled.',
  reasoning: 'SQLite provides durable local concurrency without a background service.',
  project: 'distillate',
  agent: 'codex',
  model: 'GPT-5.6',
  modelVariant: 'sol',
  reasoningEffort: 'medium',
  inputTokens: 12_000,
  outputTokens: 3_500,
  totalTokens: 15_500,
  durationMs: 92_000,
  sourceReference: 'task:test',
  idempotencyKey: 'distillate:test:shared-store',
}

afterEach(() => {
  while (stores.length) stores.pop()?.close()
  while (directories.length) {
    rmSync(directories.pop()!, { recursive: true, force: true, maxRetries: 5, retryDelay: 50 })
  }
})

describe('CardStore', () => {
  test('creates an unreviewed card and persists edits and status', () => {
    const { store } = createStore()
    const created = store.create(input)

    expect(created.created).toBe(true)
    expect(created.card.status).toBe('unreviewed')
    expect(created.card.title).toBe(input.title)
    expect(created.card.favorite).toBe(false)
    expect(created.card.model).toBe('GPT-5.6')
    expect(created.card.modelVariant).toBe('sol')
    expect(created.card.reasoningEffort).toBe('medium')
    expect(created.card.totalTokens).toBe(15_500)
    expect(created.card.durationMs).toBe(92_000)
    expect(store.list({ statuses: ['unreviewed'] })).toHaveLength(1)

    const updated = store.update(created.card.id, {
      reviewNote: 'Confirm whether a singleton writer is eventually needed.',
      challenge: 'The desktop and agent processes needed to share persisted cards safely.',
      model: 'GPT-5.6 updated',
      reasoningEffort: 'high',
    })
    expect(updated.reviewNote).toContain('singleton writer')
    expect(updated.model).toBe('GPT-5.6 updated')
    expect(updated.reasoningEffort).toBe('high')
    expect(store.list({ query: 'GPT-5.6 updated' })).toHaveLength(1)

    const favorite = store.setFavorite(created.card.id, true)
    expect(favorite.favorite).toBe(true)
    expect(store.list({ favorite: true })).toHaveLength(1)

    const reviewed = store.setStatus(created.card.id, 'reviewed')
    expect(reviewed.status).toBe('reviewed')
    expect(store.list({ statuses: ['unreviewed'] })).toHaveLength(0)
    expect(store.list({ statuses: ['reviewed'], query: 'singleton' })).toHaveLength(1)
  })

  test('returns the existing card for a repeated idempotency key', () => {
    const { store } = createStore()
    const first = store.create(input)
    const second = store.create({ ...input, challenge: 'A duplicate retry' })

    expect(first.created).toBe(true)
    expect(second.created).toBe(false)
    expect(second.card.id).toBe(first.card.id)
    expect(store.list()).toHaveLength(1)
  })

  test('keeps model metadata optional for existing capture clients', () => {
    const { store } = createStore()
    const created = store.create({
      ...input,
      model: undefined,
      modelVariant: undefined,
      reasoningEffort: undefined,
      inputTokens: undefined,
      outputTokens: undefined,
      totalTokens: undefined,
      durationMs: undefined,
      idempotencyKey: 'distillate:test:no-model',
    })

    expect(created.card.model).toBeNull()
    expect(created.card.totalTokens).toBeNull()
    expect(created.card.durationMs).toBeNull()
  })

  test('can reopen the same database without losing cards', () => {
    const { store, path } = createStore()
    const created = store.create(input).card
    store.close()
    stores.splice(stores.indexOf(store), 1)

    const reopened = new CardStore(openBunDatabase(path))
    stores.push(reopened)
    expect(reopened.get(created.id)?.challenge).toBe(input.challenge)
    expect(reopened.get(created.id)?.model).toBe(input.model)
  })
})
