const CanvasService = require("./canvasService");
const db = require("../../../configs/db");
const { stripHtml } = require("string-strip-html");

module.exports = function canvasDetailHandler(bot) {
  bot.action(/canvas_detail:(\d+):(\d+)/, async (ctx) => {
    ctx.answerCbQuery();

    const [, courseId, assignmentId] = ctx.match;

    db.get(
      "SELECT canvas_token FROM users WHERE chat_id = ?",
      [ctx.chat.id],
      async (err, row) => {
        if (err || !row?.canvas_token) {
          return ctx.reply("❌ Canvas not connected");
        }

        const canvas = new CanvasService(row.canvas_token);
        const detail = await canvas.getAssignmentDetail(courseId, assignmentId);

        ctx.reply(
          `📘 *Assignment Details*\n\n` +
          `📝 *Title:* ${detail.title}\n` +
          `📅 *Due:* ${new Date(detail.dueAt).toLocaleString()}\n` +
          `🎯 *Points:* ${detail.points}\n\n` +
          `📄 *Description:*\n${stripHtml(detail.description).result}\n\n` +
          `🔗 [Open in Canvas](${detail.htmlUrl})`,
          { parse_mode: "Markdown" }
        );
      }
    );
  });
};