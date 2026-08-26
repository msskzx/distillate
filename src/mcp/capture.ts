import { z } from 'zod'
import type { CardStore } from '../core/card-store'

export const captureCardToolSchema = z.object({
  title: z.string().trim().min(1).max(200),
  challenge: z.string().trim().min(1).max(4_000),
  solution: z.string().trim().min(1).max(4_000),
  reasoning: z.string().trim().min(1).max(4_000),
  project: z.string().trim().min(1).max(200),
  agent: z.string().trim().min(1).max(200),
  model: z.string().trim().max(2_000).nullable().optional(),
  model_variant: z.string().trim().max(200).nullable().optional(),
  reasoning_effort: z.string().trim().max(200).nullable().optional(),
  input_tokens: z.number().int().nonnegative().nullable().optional(),
  output_tokens: z.number().int().nonnegative().nullable().optional(),
  total_tokens: z.number().int().nonnegative().nullable().optional(),
  duration_ms: z.number().int().nonnegative().nullable().optional(),
  source_reference: z.string().trim().max(2_000).nullable().optional(),
  idempotency_key: z.string().trim().min(1).max(500).nullable().optional(),
})

export type CaptureCardToolInput = z.infer<typeof captureCardToolSchema>

export function captureCard(store: CardStore, input: CaptureCardToolInput) {
  const value = captureCardToolSchema.parse(input)
  return store.create({
    title: value.title,
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
    idempotencyKey: value.idempotency_key,
  })
}
