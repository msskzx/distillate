import { DatabaseSync } from 'node:sqlite'
import type { SqlDatabase } from './sqlite'

export function openNodeDatabase(path: string): SqlDatabase {
  return new DatabaseSync(path) as unknown as SqlDatabase
}
