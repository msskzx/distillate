import { afterEach, describe, expect, test } from 'bun:test'
import { mkdtempSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { CardStore } from '../src/core/card-store'
import { openBunDatabase } from '../src/core/database-bun'
import { captureCard } from '../src/mcp/capture'

let store: CardStore | null = null
let directory: string | null = null

afterEach(() => {
  store?.close()
  store = null
  if (directory) rmSync(directory, { recursive: true, force: true, maxRetries: 5, retryDelay: 50 })
  directory = null
})

describe('capture_card handler', () => {
  test('maps MCP fields into one unreviewed card and deduplicates retries', () => {
    directory = mkdtempSync(join(tmpdir(), 'distillate-mcp-'))
    store = new CardStore(openBunDatabase(join(directory, 'test.sqlite')))

    const input = {
      challenge: 'A native module would couple packaging to the Electron ABI.',
      solution: 'Use a Bun-hosted SQLite adapter for agent capture.',
      reasoning: 'This keeps the MCP process independently runnable.',
      project: 'distillate',
      agent: 'codex',
      model: 'GPT-5.6',
      model_variant: 'sol',
      reasoning_effort: 'medium',
      input_tokens: 12_000,
      output_tokens: 3_500,
      total_tokens: 15_500,
      duration_ms: 92_000,
      source_reference: 'task:mcp-test',
      idempotency_key: 'task:mcp-test:native-module',
    }

    const first = captureCard(store, input)
    const retry = captureCard(store, input)

    expect(first.created).toBe(true)
    expect(first.card.status).toBe('unreviewed')
    expect(first.card.model).toBe('GPT-5.6')
    expect(first.card.modelVariant).toBe('sol')
    expect(first.card.reasoningEffort).toBe('medium')
    expect(first.card.totalTokens).toBe(15_500)
    expect(first.card.durationMs).toBe(92_000)
    expect(first.card.sourceReference).toBe('task:mcp-test')
    expect(retry.created).toBe(false)
    expect(retry.card.id).toBe(first.card.id)
  })
})
