const db = require("../../configs/db");
const { formatDate } = require("../../utils/dateUtils");
const { Markup } = require("telegraf");

function handleListAssignments(bot) {
  // 📋 List assignments (compact)
  bot.command("list", (ctx) => {
    db.all(
      `SELECT id, title, due_time
       FROM assignments
       WHERE chat_id = ?
       ORDER BY due_time ASC`,
      [ctx.chat.id],
      (err, rows) => {
        if (err) {
          console.error(err);
          return ctx.reply("❌ Error fetching assignments");
        }

        if (!rows.length) {
          return ctx.reply("📭 No upcoming assignments");
        }

        rows.forEach((a, index) => {
          ctx.reply(
            `*${index + 1}️⃣ ${a.title}*\n` +
              `📅 Due: ${formatDate(a.due_time)}`,
            {
              parse_mode: "Markdown",
              ...Markup.inlineKeyboard([
                [
                  Markup.button.callback(
                    "🔍 View Details",
                    `assignment_detail:${a.id}`
                  ),
                ],
              ]),
            }
          );
        });
      }
    );
  });

  // 🔍 View assignment details
  bot.action(/assignment_detail:(\d+)/, (ctx) => {
    const assignmentId = ctx.match[1];
    ctx.answerCbQuery();

    db.get(
      `SELECT title, due_time, course, canvas_url
       FROM assignments
       WHERE id = ? AND chat_id = ?`,
      [assignmentId, ctx.chat.id],
      (err, a) => {
        if (err || !a) {
          return ctx.reply("❌ Assignment not found");
        }

        let msg =
          `📘 *Assignment Details*\n\n` +
          `📝 *Title:* ${a.title}\n` +
          `📅 *Due:* ${formatDate(a.due_time)}\n`;

        if (a.course) {
          msg += `🏫 *Course:* ${a.course}\n`;
        }

        if (a.canvas_url) {
          msg += `🔗 [Open in Canvas](${a.canvas_url})\n`;
        }

        ctx.reply(msg, {
          parse_mode: "Markdown",
          ...Markup.inlineKeyboard([
            [Markup.button.callback("⬅ Back to List", "back_to_list")],
          ]),
        });
      }
    );
  });

  // ⬅ Back button
  bot.action("back_to_list", (ctx) => {
    ctx.answerCbQuery();
    ctx.message = { text: "/list", chat: ctx.chat };
    bot.handleUpdate({
      update_id: Date.now(),
      message: ctx.message,
    });
  });
}

module.exports = handleListAssignments;