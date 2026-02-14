const db = require("../../configs/db");

function handleDeleteAssignment(bot) {
  bot.command("delete", (ctx) => {
    const text = ctx.message.text.split(" ")[1];
    if (!text) return ctx.reply("❌ Usage: /delete <assignment_id>");

    const id = parseInt(text);
    if (isNaN(id)) return ctx.reply("❌ Invalid ID");

    db.run(
      `DELETE FROM assignments WHERE id = ? AND chat_id = ?`,
      [id, ctx.chat.id],
      function (err) {
        if (err) return ctx.reply("❌ Error deleting assignment");
        if (this.changes === 0) return ctx.reply("❌ Assignment not found");
        ctx.reply(`✅ Assignment ID ${id} deleted`);
      },
    );
  });
}

module.exports = handleDeleteAssignment;
