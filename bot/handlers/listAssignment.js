// bot/handlers/listAssignment.js
const db = require("../../configs/db");
const { formatDate } = require("../../utils/dateUtils");
const CanvasService = require("./canvas/canvasService");
const striptags = require("striptags");
const { Markup } = require("telegraf");

function handleListAssignments(bot) {
  // 📋 1. The List Command (/list)
  bot.command("list", (ctx) => {
    const now = Date.now();
    db.run(`DELETE FROM assignments WHERE due_time <= ?`, [now], (deleteErr) => {
      db.all(
        `SELECT id, title, due_time FROM assignments WHERE chat_id = ? ORDER BY due_time ASC`,
        [ctx.chat.id],
        (err, rows) => {
          if (err || !rows?.length) return ctx.reply("📭 No upcoming assignments found.");
          let msg = "📄 *Your Assignments:*\n\n";
          rows.forEach((a) => {
            msg += `\`ID: ${a.id}\` | \`${a.title}\` | ${formatDate(a.due_time)}\n`;
          });
          msg += "\n💡 Type `/detail <ID>` to see description.";
          ctx.reply(msg, { parse_mode: "Markdown" }).catch(() => ctx.reply(msg.replace(/[*`]/g, "")));
        }
      );
    });
  });

  // 🔍 2. The Detail Command (/detail <id>)
  bot.command("detail", async (ctx) => {
    const text = ctx.message.text.split(" ")[1];
    if (!text) return ctx.reply("❌ Usage: /detail <id>");

    const localId = parseInt(text);
    db.get(`SELECT * FROM assignments WHERE id = ? AND chat_id = ?`, [localId, ctx.chat.id], async (err, a) => {
      if (err || !a) return ctx.reply("❌ Assignment not found.");
      if (!a.canvas_id || a.canvas_id === 0) return ctx.reply("❌ Manual assignment; no Canvas details.");

      db.get(`SELECT canvas_token FROM canvas_tokens WHERE chat_id = ?`, [ctx.chat.id], async (tokenErr, row) => {
        if (!row?.canvas_token) return ctx.reply("❌ Canvas token missing.");

        try {
          const canvas = new CanvasService(row.canvas_token);
          const plannerItems = await canvas.getPlannerItems();
          const item = plannerItems.find(i => i.plannable_id == a.canvas_id);
          if (!item) return ctx.reply("❌ Item not found in recent planner sync.");

          const detail = await canvas.getAssignmentDetail(item.course_id, item.plannable_id);
          
          let rawDesc = detail.description || "No description provided.";

          // --- FIXED FORMATTING FOR BETTER SPACING ---
          let formattedDesc = rawDesc
            .replace(/<\/p>/g, "\n")        // CHANGED: Single \n instead of \n\n to reduce gaps
            .replace(/<br\s*\/?>/g, "\n")   // Normal line break
            .replace(/&nbsp;/g, " ")
            .replace(/&amp;/g, "&")
            .replace(/&gt;/g, ">")
            .replace(/&lt;/g, "<")
            .replace(/&quot;/g, '"');

          // Detect and clean up the file attachment appearance
          const fileRegex = /([\w-]+\.(docx|pdf|xlsx|zip|pptx|ipynb|py))/gi;
          formattedDesc = formattedDesc.replace(fileRegex, (match) => `📎 \`${match}\``);

          let cleanDesc = striptags(formattedDesc).trim();

          // Using V2 safe escaping to prevent crashes
          const safeDesc = cleanDesc.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, "\\$1");
          const safeTitle = (detail.name || a.title).replace(/([_*\[\]()~`>#+\-=|{}.!])/g, "\\$1");
          const safeCourse = item.context_name.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, "\\$1");

          ctx.reply(
            `📘 *Assignment Detail*\n\n` +
            `📝 *Title:* ${safeTitle}\n` +
            `🏫 *Course:* ${safeCourse}\n` +
            `🎯 *Points:* ${detail.points_possible || 0}\n\n` +
            `📄 *Description:*\n${safeDesc.substring(0, 2000)}\n\n` +
            `🔗 [Open in Canvas](${detail.html_url})`,
            { parse_mode: "MarkdownV2" }
          );
        } catch (error) {
          console.error("Detail Error:", error);
          ctx.reply("❌ Failed to fetch live data from Canvas.");
        }
      });
    });
  });

  bot.action(/assignment_detail:(\d+)/, (ctx) => {
    ctx.answerCbQuery();
    bot.handleUpdate({ message: { text: `/detail ${ctx.match[1]}`, chat: ctx.chat } });
  });
}

module.exports = handleListAssignments;