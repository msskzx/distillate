import { Database } from 'bun:sqlite'
import type { SqlDatabase } from './sqlite'

export function openBunDatabase(path: string): SqlDatabase {
  const database = new Database(path, { create: true, strict: true })

  return {
    exec: (sql) => database.exec(sql),
    prepare: (sql) => ({
      run: (...params) => {
        const statement = database.prepare(sql)
        try {
          return statement.run(...params)
        } finally {
          statement.finalize()
        }
      },
      get: (...params) => {
        const statement = database.prepare(sql)
        try {
          return statement.get(...params)
        } finally {
          statement.finalize()
        }
      },
      all: (...params) => {
        const statement = database.prepare(sql)
        try {
          return statement.all(...params)
        } finally {
          statement.finalize()
        }
      },
    }),
    close: () => database.close(true),
  }
}
