// handlers/autoSyncScheduler.js
const cron = require("node-cron");
const db = require("../../../configs/db");
const CanvasService = require("./canvasService");

function startAutoSyncScheduler(bot) {
  // Run every 6 hours
  cron.schedule("0 */6 * * *", async () => {
    console.log("Running auto-sync for all users...");

    db.all(`SELECT * FROM canvas_tokens`, [], async (err, users) => {
      if (err || !users) return;

      for (const user of users) {
        try {
          const canvas = new CanvasService(
            user.canvas_domain,
            user.canvas_token,
          );
          const assignments = await canvas.getAllAssignments();

          for (const assignment of assignments) {
            const dueTime = assignment.dueDate.getTime();
            const title = `[${assignment.course}] ${assignment.title}`;

            // Only insert if doesn't exist
            db.run(
              `INSERT OR IGNORE INTO assignments (chat_id, title, due_time)
               VALUES (?, ?, ?)`,
              [user.chat_id, title, dueTime],
            );
          }

          db.run(`UPDATE canvas_tokens SET last_sync = ? WHERE chat_id = ?`, [
            Date.now(),
            user.chat_id,
          ]);
        } catch (error) {
          console.error(
            `Auto-sync failed for user ${user.chat_id}:`,
            error.message,
          );
        }
      }
    });
  });
}

module.exports = startAutoSyncScheduler;
