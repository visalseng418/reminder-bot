// handlers/canvas/removeCanvasToken.js
const db = require("../../../configs/db");

function handleRemoveCanvasToken(bot) {
  bot.command("removecanvas", (ctx) => {
    // Check if user has Canvas configured
    db.get(
      `SELECT canvas_token FROM canvas_tokens WHERE chat_id = ?`,
      [ctx.chat.id],
      (err, row) => {
        if (err || !row) {
          return ctx.reply("❌ No Canvas integration to remove.");
        }

        // Delete the token
        db.run(
          `DELETE FROM canvas_tokens WHERE chat_id = ?`,
          [ctx.chat.id],
          (err) => {
            if (err) {
              return ctx.reply("❌ Failed to remove Canvas integration");
            }

            ctx.reply(
              "✅ Canvas integration removed!\n\n" +
                "• Your Canvas token has been deleted\n" +
                "• Existing assignments will remain\n" +
                "• Use `/setcanvas` to reconnect anytime",
            );
          },
        );
      },
    );
  });
}

module.exports = handleRemoveCanvasToken;
