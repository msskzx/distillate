import { GlobalRegistrator } from '@happy-dom/global-registrator'
GlobalRegistrator.register()

import { afterEach, describe, expect, mock, test } from 'bun:test'
import { cleanup, render, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Card } from '../src/shared/cards'
import type { DistillateApi } from '../src/shared/bridge'
import { App } from '../src/renderer/src/App'

const originalSetInterval = window.setInterval

function sampleCard(overrides: Partial<Card> = {}): Card {
  return {
    id: '1485f386-3f28-4e91-878f-1f58858948c4',
    title: 'Reliable manual capture fallback',
    challenge: 'The agent needed a reliable manual capture fallback.',
    solution: 'Expose the same workflow as the $distillate skill.',
    reasoning: 'A skill supports both automatic and explicit invocation.',
    project: 'distillate',
    agent: 'codex',
    model: 'GPT-5.6',
    modelVariant: 'sol',
    reasoningEffort: 'medium',
    inputTokens: 12_000,
    outputTokens: 3_500,
    totalTokens: 15_500,
    durationMs: 92_000,
    sourceReference: 'task:skill-design',
    favorite: false,
    status: 'unreviewed',
    reviewNote: null,
    idempotencyKey: 'task:skill-design',
    createdAt: '2026-08-24T12:00:00.000Z',
    updatedAt: '2026-08-24T12:00:00.000Z',
    ...overrides,
  }
}

function installApi(overrides: Partial<Card> = {}) {
  let card = sampleCard(overrides)
  const update = mock(async (_id: string, changes: Partial<Card>) => {
    card = { ...card, ...changes, updatedAt: '2026-08-24T12:01:00.000Z' }
    return card
  })
  const setStatus = mock(async (_id: string, status: Card['status']) => {
    card = { ...card, status }
    return card
  })
  const setFavorite = mock(async (_id: string, favorite: boolean) => {
    card = { ...card, favorite }
    return card
  })
  const list = mock(async (filters: Parameters<DistillateApi['cards']['list']>[0] = {}) =>
    !filters.statuses || filters.statuses.includes(card.status) ? [{ ...card }] : [],
  )
  const getLaunchAtStartup = mock(async () => false)
  const setLaunchAtStartup = mock(async (enabled: boolean) => enabled)

  const api: DistillateApi = {
    preferences: {
      getLaunchAtStartup,
      setLaunchAtStartup,
    },
    cards: {
      list,
      get: mock(async () => card),
      create: mock(async () => ({ card, created: true })),
      update,
      setStatus,
      setFavorite,
      delete: mock(async () => true),
      projects: mock(async () => ['distillate']),
    },
  }
  window.distillate = api
  window.setInterval = mock(() => 1) as unknown as typeof window.setInterval
  return { list, update, setStatus, setFavorite, getLaunchAtStartup, setLaunchAtStartup }
}

function installEmptyApi() {
  const api: DistillateApi = {
    preferences: {
      getLaunchAtStartup: mock(async () => false),
      setLaunchAtStartup: mock(async (enabled: boolean) => enabled),
    },
    cards: {
      list: mock(async () => []),
      get: mock(async () => null),
      create: mock(async () => {
        throw new Error('Not used')
      }),
      update: mock(async () => {
        throw new Error('Not used')
      }),
      setStatus: mock(async () => {
        throw new Error('Not used')
      }),
      setFavorite: mock(async () => {
        throw new Error('Not used')
      }),
      delete: mock(async () => false),
      projects: mock(async () => []),
    },
  }
  window.distillate = api
  window.setInterval = mock(() => 1) as unknown as typeof window.setInterval
}

afterEach(() => {
  cleanup()
  window.setInterval = originalSetInterval
})

describe('review queue', () => {
  test('shows the empty queue when the bridge returns no cards', async () => {
    installEmptyApi()
    const view = render(<App />)

    expect(await view.findByText('No cards here')).toBeTruthy()
    expect(view.queryByRole('alert')).toBeNull()
  })

  test('reports a missing preload bridge without throwing an undefined cards error', async () => {
    delete (window as Partial<Window>).distillate
    window.setInterval = mock(() => 1) as unknown as typeof window.setInterval
    const view = render(<App />)

    expect((await view.findByRole('alert')).textContent).toContain(
      'The Distillate desktop bridge is unavailable. Restart the application.',
    )
  })

  test('opens a card read-only until edit is clicked, then saves edits and marks it reviewed', async () => {
    const api = installApi()
    const user = userEvent.setup({ document: window.document })
    const view = render(<App />)

    expect(await view.findByRole('button', { name: /^more/i })).toBeTruthy()
    expect(view.getByRole('heading', { name: 'Reliable manual capture fallback' })).toBeTruthy()
    expect(view.getByText('GPT-5.6 · sol')).toBeTruthy()
    expect(view.getByText('medium reasoning')).toBeTruthy()
    expect(view.getByText(/15[,.]500/)).toBeTruthy()
    expect(view.getByText('1.5 min')).toBeTruthy()
    expect(view.queryByLabelText('Challenge')).toBeNull()

    await user.click(view.getByRole('button', { name: /^more/i }))
    await user.click(view.getByRole('menuitem', { name: /^edit$/i }))

    const challenge = await view.findByDisplayValue('The agent needed a reliable manual capture fallback.')
    expect((view.getByLabelText(/^Model/) as HTMLInputElement).value).toBe('GPT-5.6')
    expect((view.getByLabelText(/^Variant/) as HTMLInputElement).value).toBe('sol')
    expect((view.getByLabelText(/^Reasoning effort/) as HTMLInputElement).value).toBe('medium')
    expect((view.getByLabelText(/^Total tokens/) as HTMLInputElement).value).toBe('15500')
    await user.clear(challenge)
    await user.type(challenge, 'The agent missed an automatic card capture.')
    await user.click(view.getByRole('button', { name: /save changes/i }))

    await waitFor(() => expect(api.update).toHaveBeenCalled())
    expect(api.update.mock.calls[0]?.[1]).toMatchObject({ challenge: 'The agent missed an automatic card capture.' })
    expect(await view.findByRole('button', { name: /^more/i })).toBeTruthy()
    expect(view.getAllByText('The agent missed an automatic card capture.').length).toBeGreaterThanOrEqual(2)
    expect(view.queryByLabelText('Challenge')).toBeNull()

    await user.click(within(view.container.querySelector('article')!).getByRole('button', { name: /^distilled$/i }))
    await waitFor(() => expect(api.setStatus).toHaveBeenCalledWith(expect.any(String), 'reviewed'))
    expect(await view.findByText('No cards here')).toBeTruthy()
  })

  test('stars a card and exposes revisit from the More menu', async () => {
    const api = installApi()
    const user = userEvent.setup({ document: window.document })
    const view = render(<App />)

    await user.click(await view.findByRole('button', { name: /^star$/i }))
    await waitFor(() => expect(api.setFavorite).toHaveBeenCalledWith(expect.any(String), true))
    expect(await within(view.container.querySelector('article')!).findByRole('button', { name: /^starred$/i })).toBeTruthy()

    await user.click(view.getByRole('button', { name: /^more/i }))
    await user.click(view.getByRole('menuitem', { name: /^revisit$/i }))
    await waitFor(() => expect(api.setStatus).toHaveBeenCalledWith(expect.any(String), 'revisit'))
  })

  test('filters with the styled project selector', async () => {
    const api = installApi()
    const user = userEvent.setup({ document: window.document })
    const view = render(<App />)

    await user.click(await view.findByRole('button', { name: 'Filter by project' }))
    await user.click(view.getByRole('option', { name: 'distillate' }))

    await waitFor(() => expect(api.list).toHaveBeenCalledWith(expect.objectContaining({ project: 'distillate' })))
  })

  test('enables launch at startup from Settings', async () => {
    const api = installApi()
    const user = userEvent.setup({ document: window.document })
    const view = render(<App />)

    await user.click(await view.findByRole('button', { name: /^settings/i }))
    await user.click(view.getByRole('menuitemcheckbox', { name: 'Launch at startup' }))

    await waitFor(() => expect(api.setLaunchAtStartup).toHaveBeenCalledWith(true))
    await user.click(view.getByRole('button', { name: /^settings/i }))
    expect(view.getByRole('menuitemcheckbox', { name: 'Launch at startup' }).getAttribute('aria-checked')).toBe('true')
  })

  test('does not replace an edited title when the background refresh completes', async () => {
    const api = installApi()
    const user = userEvent.setup({ document: window.document })
    const view = render(<App />)

    await user.click(await view.findByRole('button', { name: /^more/i }))
    await user.click(view.getByRole('menuitem', { name: /^edit$/i }))
    const title = view.getByLabelText('Title')
    await user.clear(title)
    await user.type(title, 'Agent-authored title')

    window.dispatchEvent(new Event('focus'))
    await waitFor(() => expect(api.list.mock.calls.length).toBeGreaterThan(1))
    expect((view.getByLabelText('Title') as HTMLInputElement).value).toBe('Agent-authored title')

    await user.click(view.getByRole('button', { name: /save changes/i }))
    await waitFor(() => expect(api.update).toHaveBeenCalled())
    expect(api.update.mock.calls[0]?.[1]).toMatchObject({ title: 'Agent-authored title' })
  })

  test('collapses missing run metadata into one quiet empty state', async () => {
    installApi({
      model: null,
      modelVariant: null,
      reasoningEffort: null,
      inputTokens: null,
      outputTokens: null,
      totalTokens: null,
      durationMs: null,
    })
    const view = render(<App />)

    expect(await view.findByText('No model or runtime telemetry was captured for this card.')).toBeTruthy()
    expect(view.queryByText('Model not provided')).toBeNull()
  })
})
