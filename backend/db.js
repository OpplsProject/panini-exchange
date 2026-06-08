const { DatabaseSync } = require('node:sqlite');
const path = require('path');

let db;

function getDb() {
  if (!db) {
    db = new DatabaseSync(path.join(__dirname, 'panini.db'));
    db.exec('PRAGMA journal_mode = WAL');
    db.exec('PRAGMA foreign_keys = ON');
    initSchema(db);
  }
  return db;
}

function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_stickers (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      sticker_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1 CHECK(quantity > 0),
      PRIMARY KEY (user_id, sticker_id)
    );
  `);
}

module.exports = { getDb };
