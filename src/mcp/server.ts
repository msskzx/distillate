import { McpServer } from '@modelcontextprotocol/server'
import { serveStdio } from '@modelcontextprotocol/server/stdio'
import { z } from 'zod'
import { CardStore } from '../core/card-store'
import { openBunDatabase } from '../core/database-bun'
import { getDatabasePath } from '../core/data-path'
import { captureCard } from './capture'

export function createServer(store: CardStore): McpServer {
  const server = new McpServer({ name: 'distillate', version: '0.1.0' })

  server.registerTool(
    'capture_card',
    {
      title: 'Capture Distillate card',
      description:
        'Add one concise, solved engineering challenge to the Distillate review queue. Use after the solution has been verified.',
      inputSchema: {
        challenge: z.string().trim().min(1).max(4_000).describe('The non-trivial problem or decision encountered.'),
        solution: z.string().trim().min(1).max(4_000).describe('The verified solution that was implemented.'),
        reasoning: z.string().trim().min(1).max(4_000).describe('Why this approach was chosen over reasonable alternatives.'),
        project: z.string().trim().min(1).max(200).describe('Repository or project name.'),
        agent: z.string().trim().min(1).max(200).describe('Agent name or identifier.'),
        model: z
          .string()
          .trim()
          .max(2_000)
          .nullable()
          .optional()
          .describe('Optional model family or identifier used by the agent, such as GPT-5.6.'),
        model_variant: z
          .string()
          .trim()
          .max(200)
          .nullable()
          .optional()
          .describe('Optional model variant, such as sol, terra, or luna.'),
        reasoning_effort: z
          .string()
          .trim()
          .max(200)
          .nullable()
          .optional()
          .describe('Optional reasoning effort, such as low, medium, or high.'),
        input_tokens: z.number().int().nonnegative().nullable().optional().describe('Exact input-token count when exposed by the runtime.'),
        output_tokens: z.number().int().nonnegative().nullable().optional().describe('Exact output-token count when exposed by the runtime.'),
        total_tokens: z.number().int().nonnegative().nullable().optional().describe('Exact total-token count when exposed by the runtime.'),
        duration_ms: z.number().int().nonnegative().nullable().optional().describe('Exact task duration in milliseconds when exposed by the runtime.'),
        source_reference: z
          .string()
          .trim()
          .max(2_000)
          .nullable()
          .optional()
          .describe('Optional task, commit, pull request, or branch reference.'),
        idempotency_key: z
          .string()
          .trim()
          .min(1)
          .max(500)
          .nullable()
          .optional()
          .describe('Stable optional key that prevents duplicate submissions.'),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async (input) => {
      const result = captureCard(store, input)
      return {
        content: [
          {
            type: 'text',
            text: result.created
              ? `Created Distillate card ${result.card.id} in the Unreviewed queue.`
              : `Card ${result.card.id} already exists; no duplicate was created.`,
          },
        ],
        structuredContent: {
          card: result.card,
          created: result.created,
        },
      }
    },
  )

  return server
}

if (import.meta.main) {
  const store = new CardStore(openBunDatabase(getDatabasePath()))
  serveStdio(() => createServer(store))
}
