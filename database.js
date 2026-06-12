/**
 * @module database
 * @description Embedded SQLite database layer replacing users.json.
 * Enforces strict write locks and high efficiency via WAL mode.
 */
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize DB
const db = new Database(path.join(__dirname, 'ecotrack.db'));

// Enable Write-Ahead Logging (WAL) for high concurrency and performance
db.pragma('journal_mode = WAL');
// synchronous = NORMAL is safe with WAL and provides massive speedups
db.pragma('synchronous = NORMAL');

// Ensure tables exist
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS user_state (
    user_id TEXT PRIMARY KEY,
    state_json TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

export default db;
