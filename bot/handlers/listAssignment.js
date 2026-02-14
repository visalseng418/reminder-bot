const db = require("../../configs/db");
const { formatDate } = require("../../utils/dateUtils");

function handleListAssignments(bot) {
  bot.command("list", (ctx) => {
    console.log("/list command received from chat:", ctx.chat.id);
    db.all(
      `SELECT id, title, due_time, reminded FROM assignments WHERE chat_id = ?`,
      [ctx.chat.id],
      (err, rows) => {
        if (err) return ctx.reply("❌ Error fetching assignments");

        if (rows.length === 0) return ctx.reply("📭 No assignments found");

        let msg = "📄 Your Assignments:\n\n";
        rows.forEach((a) => {
          msg += `ID: ${a.id} | ${a.title} | Due: ${formatDate(a.due_time)} | Reminded: ${a.reminded ? "✅" : "❌"}\n`;
        });
        ctx.reply(msg);
      },
    );
  });
}

module.exports = handleListAssignments;
