export type SqlValue = string | number | bigint | boolean | null

export interface SqlStatement {
  run(...params: SqlValue[]): unknown
  get(...params: SqlValue[]): unknown
  all(...params: SqlValue[]): unknown[]
}

export interface SqlDatabase {
  exec(sql: string): unknown
  prepare(sql: string): SqlStatement
  close(): void
}
