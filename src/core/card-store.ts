import { randomUUID } from 'node:crypto'
import {
  cardSchema,
  cardStatusSchema,
  createCardInputSchema,
  listCardsFiltersSchema,
  updateCardInputSchema,
  type Card,
  type CardStatus,
  type CreateCardInput,
  type CreateCardResult,
  type ListCardsFilters,
  type UpdateCardInput,
} from '../shared/cards'
import type { SqlDatabase, SqlValue } from './sqlite'

type CardRow = {
  id: string
  challenge: string
  solution: string
  reasoning: string
  project: string
  agent: string
  model: string | null
  model_variant: string | null
  reasoning_effort: string | null
  input_tokens: number | null
  output_tokens: number | null
  total_tokens: number | null
  duration_ms: number | null
  source_reference: string | null
  status: string
  review_note: string | null
  idempotency_key: string | null
  created_at: string
  updated_at: string
}

const migrations = [
  `
    CREATE TABLE IF NOT EXISTS cards (
      id TEXT PRIMARY KEY,
      challenge TEXT NOT NULL,
      solution TEXT NOT NULL,
      reasoning TEXT NOT NULL,
      project TEXT NOT NULL,
      agent TEXT NOT NULL,
      source_reference TEXT,
      status TEXT NOT NULL CHECK (status IN ('unreviewed', 'reviewed', 'revisit')),
      review_note TEXT,
      idempotency_key TEXT UNIQUE,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    ) STRICT;

    CREATE INDEX IF NOT EXISTS cards_status_created_idx
      ON cards(status, created_at DESC);
    CREATE INDEX IF NOT EXISTS cards_project_idx
      ON cards(project);
  `,
  `
    ALTER TABLE cards ADD COLUMN model TEXT;
  `,
  `
    ALTER TABLE cards ADD COLUMN model_variant TEXT;
    ALTER TABLE cards ADD COLUMN reasoning_effort TEXT;
    ALTER TABLE cards ADD COLUMN input_tokens INTEGER CHECK (input_tokens >= 0);
    ALTER TABLE cards ADD COLUMN output_tokens INTEGER CHECK (output_tokens >= 0);
    ALTER TABLE cards ADD COLUMN total_tokens INTEGER CHECK (total_tokens >= 0);
    ALTER TABLE cards ADD COLUMN duration_ms INTEGER CHECK (duration_ms >= 0);
  `,
]

function rowToCard(row: unknown): Card {
  const value = row as CardRow
  return cardSchema.parse({
    id: value.id,
    challenge: value.challenge,
    solution: value.solution,
    reasoning: value.reasoning,
    project: value.project,
    agent: value.agent,
    model: value.model,
    modelVariant: value.model_variant,
    reasoningEffort: value.reasoning_effort,
    inputTokens: value.input_tokens,
    outputTokens: value.output_tokens,
    totalTokens: value.total_tokens,
    durationMs: value.duration_ms,
    sourceReference: value.source_reference,
    status: value.status,
    reviewNote: value.review_note,
    idempotencyKey: value.idempotency_key,
    createdAt: value.created_at,
    updatedAt: value.updated_at,
  })
}

export class CardStore {
  constructor(private readonly database: SqlDatabase) {
    this.configure()
    this.migrate()
  }

  private configure(): void {
    this.database.exec('PRAGMA journal_mode = WAL;')
    this.database.exec('PRAGMA busy_timeout = 5000;')
    this.database.exec('PRAGMA foreign_keys = ON;')
  }

  private migrate(): void {
    this.database.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        applied_at TEXT NOT NULL
      ) STRICT;
    `)

    const appliedRows = this.database.prepare('SELECT version FROM schema_migrations').all() as Array<{
      version: number
    }>
    const applied = new Set(appliedRows.map((row) => Number(row.version)))

    migrations.forEach((sql, index) => {
      const version = index + 1
      if (applied.has(version)) return

      const timestamp = new Date().toISOString()
      this.database.exec('BEGIN IMMEDIATE;')
      try {
        this.database.exec(sql)
        this.database.prepare('INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)').run(version, timestamp)
        this.database.exec('COMMIT;')
      } catch (error) {
        this.database.exec('ROLLBACK;')
        throw error
      }
    })
  }

  create(input: CreateCardInput): CreateCardResult {
    const value = createCardInputSchema.parse(input)

    if (value.idempotencyKey) {
      const existing = this.database
        .prepare('SELECT * FROM cards WHERE idempotency_key = ?')
        .get(value.idempotencyKey)
      if (existing) return { card: rowToCard(existing), created: false }
    }

    const id = randomUUID()
    const timestamp = new Date().toISOString()
    this.database
      .prepare(`
        INSERT INTO cards (
          id, challenge, solution, reasoning, project, agent, model, model_variant,
          reasoning_effort, input_tokens, output_tokens, total_tokens, duration_ms, source_reference,
          status, review_note, idempotency_key, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'unreviewed', NULL, ?, ?, ?)
      `)
      .run(
        id,
        value.challenge,
        value.solution,
        value.reasoning,
        value.project,
        value.agent,
        value.model ?? null,
        value.modelVariant ?? null,
        value.reasoningEffort ?? null,
        value.inputTokens ?? null,
        value.outputTokens ?? null,
        value.totalTokens ?? null,
        value.durationMs ?? null,
        value.sourceReference ?? null,
        value.idempotencyKey ?? null,
        timestamp,
        timestamp,
      )

    return { card: this.require(id), created: true }
  }

  list(filters: ListCardsFilters = {}): Card[] {
    const value = listCardsFiltersSchema.parse(filters)
    const conditions: string[] = []
    const params: SqlValue[] = []

    if (value.statuses?.length) {
      conditions.push(`status IN (${value.statuses.map(() => '?').join(', ')})`)
      params.push(...value.statuses)
    }
    if (value.project) {
      conditions.push('project = ?')
      params.push(value.project)
    }
    if (value.query) {
      conditions.push(`(
        challenge LIKE ? OR solution LIKE ? OR reasoning LIKE ? OR
        project LIKE ? OR agent LIKE ? OR COALESCE(model, '') LIKE ? OR
        COALESCE(model_variant, '') LIKE ? OR COALESCE(reasoning_effort, '') LIKE ? OR
        COALESCE(review_note, '') LIKE ?
      )`)
      const query = `%${value.query}%`
      params.push(query, query, query, query, query, query, query, query, query)
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    return this.database
      .prepare(`SELECT * FROM cards ${where} ORDER BY created_at DESC`)
      .all(...params)
      .map(rowToCard)
  }

  get(id: string): Card | null {
    const row = this.database.prepare('SELECT * FROM cards WHERE id = ?').get(id)
    return row ? rowToCard(row) : null
  }

  private require(id: string): Card {
    const card = this.get(id)
    if (!card) throw new Error(`Card not found: ${id}`)
    return card
  }

  update(id: string, input: UpdateCardInput): Card {
    this.require(id)
    const value = updateCardInputSchema.parse(input)
    const columnByField: Record<keyof UpdateCardInput, string> = {
      challenge: 'challenge',
      solution: 'solution',
      reasoning: 'reasoning',
      project: 'project',
      agent: 'agent',
      model: 'model',
      modelVariant: 'model_variant',
      reasoningEffort: 'reasoning_effort',
      inputTokens: 'input_tokens',
      outputTokens: 'output_tokens',
      totalTokens: 'total_tokens',
      durationMs: 'duration_ms',
      sourceReference: 'source_reference',
      reviewNote: 'review_note',
    }
    const entries = Object.entries(value) as Array<[keyof UpdateCardInput, unknown]>
    if (!entries.length) return this.require(id)

    const timestamp = new Date().toISOString()
    const assignments = entries.map(([field]) => `${columnByField[field]} = ?`)
    const params = entries.map(([, fieldValue]) => fieldValue ?? null) as SqlValue[]
    this.database
      .prepare(`UPDATE cards SET ${assignments.join(', ')}, updated_at = ? WHERE id = ?`)
      .run(...params, timestamp, id)
    return this.require(id)
  }

  setStatus(id: string, status: CardStatus): Card {
    this.require(id)
    const value = cardStatusSchema.parse(status)
    this.database
      .prepare('UPDATE cards SET status = ?, updated_at = ? WHERE id = ?')
      .run(value, new Date().toISOString(), id)
    return this.require(id)
  }

  delete(id: string): boolean {
    const result = this.database.prepare('DELETE FROM cards WHERE id = ?').run(id) as {
      changes?: number
      changesCount?: number
    }
    return Number(result.changes ?? result.changesCount ?? 0) > 0
  }

  projects(): string[] {
    return (this.database.prepare('SELECT DISTINCT project FROM cards ORDER BY project').all() as Array<{ project: string }>).map(
      (row) => row.project,
    )
  }

  close(): void {
    this.database.close()
  }
}
