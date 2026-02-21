// handlers/autoSyncScheduler.js
const cron = require("node-cron");
const db = require("../../../configs/db");
const CanvasService = require("./canvasService");

function startAutoSyncScheduler(bot) {
  // Run every 24 hours at midnight
  cron.schedule("0 0 * * *", async () => {
    console.log("🔄 [AUTO-SYNC] Starting daily auto-sync for all users...");
    const startTime = Date.now();

    db.all(`SELECT * FROM canvas_tokens`, [], async (err, users) => {
      if (err) {
        console.error("❌ [AUTO-SYNC] Error fetching users:", err);
        return;
      }

      if (!users || users.length === 0) {
        console.log("ℹ️ [AUTO-SYNC] No users with Canvas tokens found.");
        return;
      }

      console.log(`📊 [AUTO-SYNC] Found ${users.length} user(s) to sync`);

      let totalSynced = 0;
      let totalFailed = 0;

      for (const user of users) {
        try {
          console.log(`\n🔄 [AUTO-SYNC] Syncing user ${user.chat_id}...`);

          const canvas = new CanvasService(user.canvas_token);
          const assignments = await canvas.getAllAssignments();

          console.log(
            `   📚 Found ${assignments.length} assignment(s) from Canvas`,
          );

          let imported = 0;
          let skipped = 0;

          for (const assignment of assignments) {
            const dueTime = assignment.dueDate.getTime();
            const title = `[${assignment.course}] ${assignment.title}`;

            // Check if assignment already exists
            const existing = await new Promise((resolve) => {
              db.get(
                `SELECT id FROM assignments WHERE chat_id = ? AND title = ? AND due_time = ?`,
                [user.chat_id, title, dueTime],
                (err, row) => resolve(row),
              );
            });

            if (existing) {
              skipped++;
            } else {
              // Insert new assignment
              await new Promise((resolve, reject) => {
                db.run(
                  `INSERT INTO assignments (chat_id, title, due_time)
                   VALUES (?, ?, ?)`,
                  [user.chat_id, title, dueTime],
                  (err) => (err ? reject(err) : resolve()),
                );
              });
              imported++;
            }
          }

          // Update last sync time
          db.run(`UPDATE canvas_tokens SET last_sync = ? WHERE chat_id = ?`, [
            Date.now(),
            user.chat_id,
          ]);

          console.log(
            `   ✅ User ${user.chat_id}: Imported ${imported}, Skipped ${skipped}`,
          );
          totalSynced++;
        } catch (error) {
          console.error(
            `   ❌ User ${user.chat_id} sync failed:`,
            error.message,
          );
          totalFailed++;
        }
      }

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`\n✨ [AUTO-SYNC] Complete! Duration: ${duration}s`);
      console.log(`   ✅ Successful: ${totalSynced}`);
      console.log(`   ❌ Failed: ${totalFailed}`);
      console.log(`   📊 Total users: ${users.length}`);
    });
  });

  console.log("⏰ Auto-sync scheduler started (runs daily at midnight)");
}

module.exports = startAutoSyncScheduler;
