import { describe, expect, test } from 'bun:test'
import { normalize } from 'node:path'
import { getPreloadPath } from '../src/main/window-paths'
import { desktopAppId, preloadEntryFileName, rendererDevServerPort } from '../src/shared/runtime'

describe('Electron window configuration', () => {
  test('uses the emitted CommonJS preload entry required by the renderer sandbox', () => {
    expect(preloadEntryFileName).toBe('index.cjs')
    expect(normalize(getPreloadPath('C:\\app\\out\\main'))).toBe(
      normalize('C:\\app\\out\\preload\\index.cjs'),
    )
  })

  test('reserves port 5175 for the renderer development server', () => {
    expect(rendererDevServerPort).toBe(5175)
  })

  test('uses a stable Windows application identity for shortcuts and taskbar pinning', () => {
    expect(desktopAppId).toBe('com.distillate.desktop')
  })
})
