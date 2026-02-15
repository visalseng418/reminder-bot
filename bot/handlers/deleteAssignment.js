const db = require("../../configs/db");

function handleDeleteAssignment(bot) {
  bot.command("delete", (ctx) => {
    const text = ctx.message.text.split(" ")[1];
    if (!text) return ctx.reply("❌ Usage: /delete <assignment_id>");

    const id = parseInt(text);
    if (isNaN(id)) return ctx.reply("❌ Invalid ID");

    // First, get the assignment title before deleting
    db.get(
      `SELECT title FROM assignments WHERE id = ? AND chat_id = ?`,
      [id, ctx.chat.id],
      (err, row) => {
        if (err) return ctx.reply("❌ Error fetching assignment");
        if (!row) return ctx.reply("❌ Assignment not found");

        const title = row.title;

        // Now delete the assignment
        db.run(
          `DELETE FROM assignments WHERE id = ? AND chat_id = ?`,
          [id, ctx.chat.id],
          function (err) {
            if (err) return ctx.reply("❌ Error deleting assignment");
            ctx.reply(`✅ Assignment ID ${id}, "${title}" deleted`);
          },
        );
      },
    );
  });
}

module.exports = handleDeleteAssignment;
