import { join } from 'node:path'
import { preloadEntryFileName } from '../shared/runtime'

export function getPreloadPath(mainOutputDirectory: string): string {
  return join(mainOutputDirectory, '../preload', preloadEntryFileName)
}
