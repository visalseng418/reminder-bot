// handlers/setCanvasToken.js
const db = require("../../../configs/db");

function handleSetCanvasToken(bot) {
  bot.command("setcanvas", (ctx) => {
    const parts = ctx.message.text.split(" ");

    if (parts.length < 2) {
      return ctx.reply(
        "⚙️ *Setup Canvas Integration*\n\n" +
          "Usage: `/setcanvas <canvastoken>`\n\n" +
          "*Example:*\n" +
          "`/setcanvas your_token_here`\n\n" +
          "*How to get your token:*\n" +
          "1. Go to Canvas → Account → Settings\n" +
          "2. Click '+ New Access Token'\n" +
          "3. Copy the token and paste it here\n\n" +
          "⚠️ Keep your token private!",
        { parse_mode: "Markdown" },
      );
    }

    const token = parts[1];

    db.run(
      `INSERT OR REPLACE INTO canvas_tokens (chat_id, canvas_token)
       VALUES (?, ?)`,
      [ctx.chat.id, token],
      (err) => {
        if (err) {
          console.error("Error saving Canvas Token:", err);
          return ctx.reply("❌ Failed to save Canvas token");
        }

        // Delete the message containing the token for security
        ctx.deleteMessage(ctx.message.message_id).catch(() => {});

        ctx.reply(
          "✅ Canvas integration configured!\n\n" +
            "Use `/sync` to import your assignments.",
        );
      },
    );
  });
}

module.exports = handleSetCanvasToken;
