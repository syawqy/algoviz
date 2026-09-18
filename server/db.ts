import { Database } from 'bun:sqlite';
import { config } from './env';

let db: Database | null = null;

// Schema note: `problems.visual_kind` selects which interactive renderer the
// client uses, and `visual_data` carries the concrete frames' inputs (array,
// target, edges...). Keeping them as data means new problems need no code.
export function openDB(path: string = config.dbPath): Database {
  const database = new Database(path, { create: true });
  database.exec('PRAGMA journal_mode = WAL;');
  database.exec('PRAGMA foreign_keys = ON;');
  // Without a checkpoint the WAL grows without bound: SQLite only truncates it
  // automatically at 1000 pages (~4 MB), and a long-running server that never
  // idles keeps appending. Cap it so a small always-on box cannot fill its disk.
  database.exec('PRAGMA wal_autocheckpoint = 256;');
  database.exec('PRAGMA synchronous = NORMAL;');
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin','learner')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS patterns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      blurb TEXT NOT NULL,
      recognition TEXT NOT NULL,
      complexity TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS problems (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pattern_id INTEGER NOT NULL REFERENCES patterns(id),
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      difficulty TEXT NOT NULL CHECK (difficulty IN ('mudah','sedang','sulit')),
      statement TEXT NOT NULL,
      hint TEXT NOT NULL,
      walkthrough TEXT NOT NULL,
      solution TEXT NOT NULL,
      solution_lang TEXT NOT NULL DEFAULT 'python',
      visual_kind TEXT NOT NULL,
      visual_data TEXT NOT NULL DEFAULT '{}',
      time_complexity TEXT NOT NULL,
      space_complexity TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS progress (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      problem_id INTEGER NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
      status TEXT NOT NULL CHECK (status IN ('selesai','ulang')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, problem_id)
    );
  `);
  return database;
}

export function getDB(): Database {
  if (!db) db = openDB();
  return db;
}

// For tests: fresh in-memory db with identical schema
export function openTestDB(): Database {
  return openDB(':memory:');
}
