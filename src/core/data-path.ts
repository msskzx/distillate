import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

export function getDataDirectory(environment = process.env): string {
  if (environment.DISTILLATE_DATA_DIR) {
    return environment.DISTILLATE_DATA_DIR
  }

  if (process.platform === 'win32') {
    const localAppData = environment.LOCALAPPDATA
    if (!localAppData) {
      throw new Error('LOCALAPPDATA is unavailable; set DISTILLATE_DATA_DIR explicitly')
    }
    return join(localAppData, 'Distillate')
  }

  const base = environment.XDG_DATA_HOME ?? (environment.HOME ? join(environment.HOME, '.local', 'share') : null)
  if (!base) {
    throw new Error('No data directory is available; set DISTILLATE_DATA_DIR explicitly')
  }
  return join(base, 'distillate')
}

export function getDatabasePath(environment = process.env): string {
  const directory = getDataDirectory(environment)
  mkdirSync(directory, { recursive: true })
  return join(directory, 'distillate.sqlite')
}
