const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./assignments.db");

// Initialize table if not exists
db.run(
  `
CREATE TABLE IF NOT EXISTS assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id TEXT,
    title TEXT,
    due_time INTEGER,
    reminded INTEGER DEFAULT 0
)
`,
  () => {
    // Add new columns if they don't exist
    db.run(
      `ALTER TABLE assignments ADD COLUMN reminded_1d INTEGER DEFAULT 0`,
      (err) => {
        if (err && !err.message.includes("duplicate column name")) {
          console.error("Error adding reminded_1d column:", err);
        }
      },
    );

    db.run(
      `ALTER TABLE assignments ADD COLUMN reminded_5h INTEGER DEFAULT 0`,
      (err) => {
        if (err && !err.message.includes("duplicate column name")) {
          console.error("Error adding reminded_5h column:", err);
        }
      },
    );
  },
);

// Initialize canvas_tokens table
db.run(
  `CREATE TABLE IF NOT EXISTS canvas_tokens (
    chat_id INTEGER PRIMARY KEY,
    canvas_token TEXT NOT NULL,
    last_sync INTEGER DEFAULT 0
  )`,
  (err) => {
    if (err) {
      console.error("Error creating canvas_tokens table:", err);
    }
  },
);

module.exports = db;
