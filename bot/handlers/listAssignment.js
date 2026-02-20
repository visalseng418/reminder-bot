const db = require("../../configs/db");
const { formatDate } = require("../../utils/dateUtils");

function handleListAssignments(bot) {
  bot.command("list", (ctx) => {
    const now = Date.now();

    // 1️⃣ Delete expired assignments first
    db.run(
      `DELETE FROM assignments WHERE due_time <= ?`,
      [now],
      (deleteErr) => {
        if (deleteErr) {
          console.error(deleteErr);
          return ctx.reply("❌ Error cleaning expired assignments");
        }

        // 2️⃣ Fetch remaining (active) assignments
        db.all(
          `SELECT id, title, due_time
           FROM assignments
           WHERE chat_id = ?
           ORDER BY due_time ASC`,
          [ctx.chat.id],
          (err, rows) => {
            if (err) return ctx.reply("❌ Error fetching assignments");

            if (rows.length === 0)
              return ctx.reply("📭 No upcoming assignments");

            let msg = "📄 Your Assignments:\n\n";
            rows.forEach((a) => {
              msg += `ID: ${a.id} | ${a.title} | Due: ${formatDate(a.due_time)}\n`;
            });

            ctx.reply(msg);
          },
        );
      },
    );
  });
}

module.exports = handleListAssignments;
