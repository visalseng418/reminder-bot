const cron = require("node-cron");
const db = require("../../configs/db");
const { formatTime } = require("../../utils/dateUtils");
function startReminderScheduler(bot) {
  cron.schedule("* * * * *", () => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const fiveHours = 5 * 60 * 60 * 1000;

    // 🔔 1-DAY REMINDER
    db.all(
      `SELECT * FROM assignments
       WHERE due_time > ?
       AND due_time - ? <= ?
       AND reminded_1d = 0`,
      [now, now, oneDay],
      (err, rows) => {
        if (err || !rows?.length) return;

        rows.forEach((a) => {
          const timeLeft = a.due_time - now; // milliseconds
          const formattedTimeLeft = formatTime(timeLeft);

          bot.telegram.sendMessage(
            a.chat_id,
            `📅Reminder!!!!!!!\n"${a.title}" is due in ${formattedTimeLeft}`,
          );

          db.run(`UPDATE assignments SET reminded_1d = 1 WHERE id = ?`, [a.id]);
        });
      },
    );

    // 🔔 5-HOUR REMINDER
    db.all(
      `SELECT * FROM assignments
       WHERE due_time > ?
       AND due_time - ? <= ?
       AND reminded_5h = 0`,
      [now, now, fiveHours],
      (err, rows) => {
        if (err || !rows?.length) return;

        rows.forEach((a) => {
          const timeLeft = a.due_time - now; // milliseconds
          const formattedTimeLeft = formatTime(timeLeft);

          bot.telegram.sendMessage(
            a.chat_id,
            `📅Reminder!!!!!!!\n"${a.title}" is due in ${formattedTimeLeft}!`,
          );

          db.run(`UPDATE assignments SET reminded_5h = 1 WHERE id = ?`, [a.id]);
        });
      },
    );
  });
}

module.exports = startReminderScheduler;
