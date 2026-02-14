//const { getSession, clearSession } = require("../session");
const db = require("../../configs/db");
const { parseDate, formatDate } = require("../../utils/dateUtils");

function handleAddAssignment(bot) {
  // Start add flow
  bot.command("add", (ctx) => {
    ctx.session = {
      step: "TITLE",
    };

    ctx.reply("📝 What is the assignment title?");
  });

  // Handle text ONLY during add flow
  bot.on("text", (ctx, next) => {
    // 🚫 Ignore commands like /list, /delete, etc.
    if (ctx.message.text.startsWith("/")) return next();

    // 🚫 Ignore if not in add flow
    if (!ctx.session || !ctx.session.step) return next();

    // Step 1: title
    /* ---------------- STEP 1: TITLE ---------------- */
    if (ctx.session.step === "TITLE") {
      const title = ctx.message.text.trim();

      // 🔍 Check for duplicate assignment (same chat)
      db.get(
        `SELECT id FROM assignments WHERE chat_id = ? AND title = ?`,
        [ctx.chat.id, title],
        (err, row) => {
          if (err) {
            console.error(err);
            ctx.session = null;
            return ctx.reply("❌ Error checking assignment");
          }

          if (row) {
            // ❌ Duplicate found
            ctx.session = null;
            return ctx.reply(`⚠️"${title}" already exists.`);
          }

          // ✅ No duplicate → continue
          ctx.session.title = title;
          ctx.session.step = "DATE";

          return ctx.reply("📅 Enter due date (MM-DD HH:mm):");
        },
      );

      return;
    }

    // Step 2: date
    if (ctx.session.step === "DATE") {
      const input = ctx.message.text.trim();

      // Expected format: MM-DD HH:mm
      const match = input.match(/^(\d{2})-(\d{2}) (\d{2}):(\d{2})$/);

      if (!match) {
        return ctx.reply("❌ Invalid date format.\nExample: 02-12 18:00");
      }

      const [, month, day, hour, minute] = match;
      const year = new Date().getFullYear();

      const dueTime = new Date(
        year,
        Number(month) - 1,
        Number(day),
        Number(hour),
        Number(minute),
      );

      // Extra safety check (invalid date like 02-30)
      if (isNaN(dueTime.getTime())) {
        return ctx.reply("❌ Invalid date value. Please try again.");
      }

      db.run(
        `INSERT INTO assignments (chat_id, title, due_time)
         VALUES (?, ?, ?)`,
        [ctx.chat.id, ctx.session.title, dueTime],
        (err) => {
          if (err) {
            console.error(err);
            return ctx.reply("❌ Failed to save assignment");
          }

          ctx.reply(
            `✅"${ctx.session.title}" saved!\n` +
              `Due at: ${formatDate(dueTime)}`,
          );

          // ✅ Clear session so other commands work
          ctx.session = null;
        },
      );
    }
  });
}

module.exports = handleAddAssignment;
