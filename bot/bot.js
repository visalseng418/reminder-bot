require("dotenv").config();
const { Telegraf, session } = require("telegraf");

const handleAddAssignment = require("./handlers/addAssignment");
const handleListAssignments = require("./handlers/listAssignment");
const handleDeleteAssignment = require("./handlers/deleteAssignment");
const handleDeleteAllAssignments = require("./handlers/deleteAllAssignment");
const startReminderScheduler = require("./handlers/reminderScheduler");

if (!process.env.BOT_TOKEN) {
  throw new Error("BOT_TOKEN is missing");
}

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use(session());

bot.use((ctx, next) => {
  console.log("Incoming:", ctx.message?.text);
  return next();
});

// Start command
bot.start((ctx) => {
  ctx.reply(
    "📚 Assignment Reminder Bot\n\nCommands:\n" +
      "/add - Add Assignment\n" +
      "/list - List Assignments\n" +
      "/delete <id> - Delete Assignment",
  );
});

// Register handlers
handleAddAssignment(bot);
handleListAssignments(bot);
handleDeleteAllAssignments(bot);
handleDeleteAssignment(bot);

// Start cron scheduler
startReminderScheduler(bot);

// Launch bot
bot.launch();
console.log("Bot running...");
