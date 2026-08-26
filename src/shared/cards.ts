import { z } from 'zod'

export const cardStatuses = ['unreviewed', 'reviewed', 'revisit'] as const
export const cardStatusSchema = z.enum(cardStatuses)
export type CardStatus = z.infer<typeof cardStatusSchema>

const requiredSummary = z.string().trim().min(1).max(4_000)
const optionalContext = z.string().trim().max(2_000).nullable().optional()
const optionalLabel = z.string().trim().max(200).nullable().optional()
const optionalCount = z.number().int().nonnegative().nullable().optional()

export const createCardInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  challenge: requiredSummary,
  solution: requiredSummary,
  reasoning: requiredSummary,
  project: z.string().trim().min(1).max(200),
  agent: z.string().trim().min(1).max(200),
  model: optionalContext,
  modelVariant: optionalLabel,
  reasoningEffort: optionalLabel,
  inputTokens: optionalCount,
  outputTokens: optionalCount,
  totalTokens: optionalCount,
  durationMs: optionalCount,
  sourceReference: optionalContext,
  idempotencyKey: z.string().trim().min(1).max(500).nullable().optional(),
})

export type CreateCardInput = z.infer<typeof createCardInputSchema>

export const updateCardInputSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  challenge: requiredSummary.optional(),
  solution: requiredSummary.optional(),
  reasoning: requiredSummary.optional(),
  project: z.string().trim().min(1).max(200).optional(),
  agent: z.string().trim().min(1).max(200).optional(),
  model: optionalContext,
  modelVariant: optionalLabel,
  reasoningEffort: optionalLabel,
  inputTokens: optionalCount,
  outputTokens: optionalCount,
  totalTokens: optionalCount,
  durationMs: optionalCount,
  sourceReference: optionalContext,
  reviewNote: optionalContext,
})

export type UpdateCardInput = z.infer<typeof updateCardInputSchema>

export const cardSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  challenge: z.string(),
  solution: z.string(),
  reasoning: z.string(),
  project: z.string(),
  agent: z.string(),
  model: z.string().nullable(),
  modelVariant: z.string().nullable(),
  reasoningEffort: z.string().nullable(),
  inputTokens: z.number().int().nonnegative().nullable(),
  outputTokens: z.number().int().nonnegative().nullable(),
  totalTokens: z.number().int().nonnegative().nullable(),
  durationMs: z.number().int().nonnegative().nullable(),
  sourceReference: z.string().nullable(),
  favorite: z.boolean(),
  status: cardStatusSchema,
  reviewNote: z.string().nullable(),
  idempotencyKey: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Card = z.infer<typeof cardSchema>

export const listCardsFiltersSchema = z.object({
  statuses: z.array(cardStatusSchema).optional(),
  project: z.string().trim().optional(),
  query: z.string().trim().optional(),
  favorite: z.boolean().optional(),
})

export type ListCardsFilters = z.infer<typeof listCardsFiltersSchema>

export type CreateCardResult = {
  card: Card
  created: boolean
}
