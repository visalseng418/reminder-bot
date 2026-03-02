// bot/handlers/canvas/listCanvasAssignments.js
const CanvasService = require("./canvasService");
const db = require("../../../configs/db");

module.exports = function listCanvasAssignments(bot) {
  bot.command("listcanvas", async (ctx) => { // Renamed to avoid conflict with local /list
    // FIX: Changed table name from 'users' to 'canvas_tokens'
    db.get(
      "SELECT canvas_token FROM canvas_tokens WHERE chat_id = ?",
      [ctx.chat.id],
      async (err, row) => {
        if (err || !row?.canvas_token) {
          return ctx.reply("❌ Canvas not connected. Use /setcanvas");
        }

        const canvas = new CanvasService(row.canvas_token);
        const assignments = await canvas.getPlannerAssignments();

        if (!assignments.length) {
          return ctx.reply("📭 No upcoming assignments found on Canvas.");
        }

        for (const a of assignments) {
          await ctx.reply(
            `*${a.title}*\n🏫 ${a.courseName}\n📅 Due: ${new Date(a.dueAt).toLocaleString()}`,
            {
              parse_mode: "Markdown",
              reply_markup: {
                inline_keyboard: [[
                  {
                    text: "🔍 View Details",
                    callback_data: `canvas_detail:${a.courseId}:${a.assignmentId}`,
                  }
                ]]
              }
            }
          );
        }
      }
    );
  });
};