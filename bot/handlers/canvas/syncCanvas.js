// handlers/syncCanvas.js
const db = require("../../../configs/db");
const CanvasService = require("./canvasService");

function handleSyncCanvas(bot) {
  bot.command("sync", async (ctx) => {
    // Get user's Canvas credentials
    db.get(
      `SELECT canvas_token FROM canvas_tokens WHERE chat_id = ?`,
      [ctx.chat.id],
      async (err, row) => {
        if (err || !row) {
          return ctx.reply(
            "❌ Canvas not configured.\n\n" +
              "Use `/setcanvas` to setup Canvas integration first.",
          );
        }

        ctx.reply("🔄 Syncing assignments from Canvas...");

        try {
          const canvas = new CanvasService(row.canvas_token);
          const assignments = await canvas.getAllAssignments();

          if (assignments.length === 0) {
            return ctx.reply("✅ No upcoming assignments found in Canvas.");
          }

          //loggin data.
          //console.log(assignments);
          let imported = 0;
          let skipped = 0;

          for (const assignment of assignments) {
            const dueTime = assignment.dueDate.getTime();
            const title = `[${assignment.course}] ${assignment.title}`;
            console.log(`Title: ${title} and dueTime ${dueTime}`);

            // Check if assignment already exists
            const existing = await new Promise((resolve) => {
              db.get(
                `SELECT id FROM assignments 
                 WHERE chat_id = ? AND title = ? AND due_time = ?`,
                [ctx.chat.id, title, dueTime],
                (err, row) => resolve(row),
              );
            });

            if (existing) {
              skipped++;
              continue;
            }

            // Insert new assignment
            await new Promise((resolve, reject) => {
              db.run(
                `INSERT INTO assignments (chat_id, title, due_time)
                 VALUES (?, ?, ?)`,
                [ctx.chat.id, title, dueTime],
                (err) => (err ? reject(err) : resolve()),
              );
            });

            imported++;
          }

          // Update last sync time
          db.run(`UPDATE canvas_tokens SET last_sync = ? WHERE chat_id = ?`, [
            Date.now(),
            ctx.chat.id,
          ]);

          ctx.reply(
            `✅ Sync complete!\n\n` +
              `📥 Imported: ${imported}\n` +
              `⏭️ Skipped: ${skipped} (already exists)\n` +
              `📚 Total: ${assignments.length}`,
          );
        } catch (error) {
          console.error("Sync error:", error);
          ctx.reply(
            "❌ Failed to sync with Canvas.\n\n" +
              "Please check:\n" +
              "• Your Canvas token is valid\n" +
              "• Your Canvas domain is correct\n" +
              "• You have access to your courses",
          );
        }
      },
    );
  });
}

module.exports = handleSyncCanvas;
