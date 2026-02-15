const db = require("../../configs/db");

function handleDeleteAllAssignments(bot) {
  bot.command("deleteall", (ctx) => {
    ctx.session = { confirmDeleteAll: true };

    // First, check if there are any assignments to delete
    db.get(
      `SELECT COUNT(*) as count FROM assignments WHERE chat_id = ?`,
      [ctx.chat.id],
      (err, row) => {
        if (err) return ctx.reply("❌ Error checking assignments");

        if (row.count === 0) {
          return ctx.reply("❌ No assignments found");
        }
      },
    );
    ctx.reply(
      "⚠️ This will delete *ALL* your assignments.\n\n" +
        "Type `CONFIRM` to proceed or anything else to cancel.",
      { parse_mode: "Markdown" },
    );
  });

  bot.on("text", (ctx, next) => {
    if (!ctx.session?.confirmDeleteAll) return next();

    if (ctx.message.text !== "CONFIRM") {
      ctx.session = null;
      return ctx.reply("❎ Delete all cancelled");
    }

    db.run(
      `DELETE FROM assignments WHERE chat_id = ?`,
      [ctx.chat.id],
      function (err) {
        ctx.session = null;

        if (err) return ctx.reply("❌ Failed to delete assignments");

        ctx.reply(`🗑️ Deleted ${this.changes} assignment(s)`);
      },
    );
  });
}

module.exports = handleDeleteAllAssignments;
