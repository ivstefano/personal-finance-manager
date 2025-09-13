import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

const sqlite = new Database('./sqlite.db')
sqlite.pragma('journal_mode = WAL')

export const db = drizzle(sqlite, { schema })

export * from './schema'