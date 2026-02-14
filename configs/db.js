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

module.exports = db;
