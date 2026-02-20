require("dotenv").config();
const { Telegraf, session, Markup } = require("telegraf");

const handleAddAssignment = require("./handlers/addAssignment");
const handleListAssignments = require("./handlers/listAssignment");
const handleDeleteAssignment = require("./handlers/deleteAssignment");
const handleDeleteAllAssignments = require("./handlers/deleteAllAssignment");
const startReminderScheduler = require("./handlers/reminderScheduler");

//Canvas Integration
const handleSyncCanvas = require("./handlers/canvas/syncCanvas");
const handleSetCanvasToken = require("./handlers/canvas/setCanvasToken");
const CanvasService = require("./handlers/canvas/canvasService");
const startAutoSyncScheduler = require("./handlers/canvas/autoSynceScheduler");
const handleRemoveCanvasToken = require("./handlers/canvas/removeCanvasToken");

const BOT_TOKEN =
  process.env.NODE_ENV === "production"
    ? process.env.PROD_BOT_TOKEN
    : process.env.DEV_BOT_TOKEN;

if (!BOT_TOKEN) {
  throw new Error(
    `${process.env.NODE_ENV === "production" ? "PROD_BOT_TOKEN" : "DEV_BOT_TOKEN"} is missing`,
  );
}

const bot = new Telegraf(BOT_TOKEN);
bot.use(session());

bot.use((ctx, next) => {
  console.log("Incoming:", ctx.message?.text);
  return next();
});

// Start command with inline keyboard
bot.start((ctx) => {
  ctx.reply(
    "👋 Hi there! I'm the damn Rabbit.\n\n" +
      "I'll help you stay on top of your deadlines by sending timely reminders 1 day and 5 hours before your assignments are due. Just add your assignments and due dates, and I'll take care of the rest! ⏰\n\n" +
      "🔗 *Canvas Integration (Recommended)*\n" +
      "1. Go to Canvas → Account → Settings\n" +
      "2. Scroll to 'Approved Integrations'\n" +
      "3. Click '+ New Access Token'\n" +
      "4. Copy the token\n" +
      "5. Use `/setcanvas <your_token>` here\n" +
      "6. Run `/sync` to import your assignments\n\n" +
      "✨ Once connected, your Canvas assignments will sync automatically!\n\n" +
      "Use the buttons below to manage your assignments 📚:",
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [
          Markup.button.callback("🔄 Sync Canvas", "sync"),
          Markup.button.callback("🔓 Remove Canvas", "remove_canvas"),
        ],
        [
          //Markup.button.callback("📚 Add Assignment", "add"),
          Markup.button.callback("📋 List Assignments", "list"),
        ],
        [Markup.button.callback("🗑️ Delete Assignment by ID", "delete")],
        [Markup.button.callback("🗑️ Delete All", "deleteall")],
        [Markup.button.callback("⚙️ Canvas Settings", "canvas_settings")],
        [Markup.button.callback("ℹ️ Help", "help")],
      ]),
    },
  );
});

// Help command to show the menu again
bot.command("menu", (ctx) => {
  ctx.reply(
    "👋 Hi there! I’m the damn Rabbit.\n\n I’ll help you stay on top of your deadlines by sending timely reminders 1 day and 5 hours before your assignments are due. Just add your assignments and due dates, and I’ll take care of the rest!⏰\n\n" +
      "Use the instructions below to manage your assignments 📚:",
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [
          Markup.button.callback("📚 Add Assignment", "add"),
          Markup.button.callback("📋 List Assignments", "list"),
        ],
        [Markup.button.callback("🗑️ Delete Assignment by ID", "delete")],
        [Markup.button.callback("🗑️ Delete All", "deleteall")],
        [Markup.button.callback("ℹ️ Help", "help")],
      ]),
    },
  );
});

// Handle button callbacks
bot.action("add", (ctx) => {
  ctx.answerCbQuery();
  ctx.reply(
    "*To add new assignment, use: /add*\n\n" +
      "*Example:*\n" +
      "`/add`\n" +
      "📝 What is the assignment title?\n" +
      "`Assignment 01`\n" +
      "📅 Enter due date (MM-DD HH:mm):\n" +
      "`12-31 23:59`",
    { parse_mode: "Markdown" },
  );
});

bot.action("list", (ctx) => {
  ctx.answerCbQuery();
  ctx.reply(
    "*To see all of the assignments, use: /list*\n\n" +
      "*Example:*\n" +
      "`/list`\n" +
      "ID 1 | Assignment 01 | Due at 12-31 23:59\n" +
      "ID 2 | Assignment 02 | Due at 12-31 23:59",
    { parse_mode: "Markdown" },
  );
});

bot.action("delete", (ctx) => {
  ctx.answerCbQuery();
  ctx.reply(
    "*To delete an assignment, use: `/delete <assignment_id>*\n\n" +
      "*Example:*\n" +
      "`/delete 5`\n\n" +
      "💡 Tip: Use `/list` to see assignment IDs",
    { parse_mode: "Markdown" },
  );
});

bot.action("deleteall", (ctx) => {
  ctx.answerCbQuery();
  ctx.reply(
    "*To delete all assignments, use:* `/deleteall`\n\n" +
      "⚠️ *Warning:* This will permanently delete ALL your assignments!",
    { parse_mode: "Markdown" },
  );
});

bot.action("help", (ctx) => {
  ctx.answerCbQuery();
  ctx.reply(
    "📚 *Assignment Reminder Bot Help*\n\n" +
      "*Commands:*\n" +
      "• `/sync` - Import assignments from Canvas\n" +
      "• `/list` - View all assignments\n" +
      "• `/delete <id>` - Delete specific assignment\n" +
      "• `/deleteall` - Delete all assignments\n" +
      "• `/removecanvas` - Remove Canvas Integration\n" +
      "• `/menu` - Show main menu\n\n" +
      "*Date Format:*\n" +
      "`MM-DD HH:mm` (e.g., 02-20 23:59)\n\n" +
      "*Reminders:*\n" +
      "🔔 You'll receive reminders:\n" +
      "• 24 hours before due\n" +
      "• 5 hours before due",
    { parse_mode: "Markdown" },
  );
});

bot.action("sync", (ctx) => {
  ctx.answerCbQuery();
  ctx.message = { text: "/sync", chat: ctx.chat };
  ctx.reply("Use `/sync` to import assignments from Canvas", {
    parse_mode: "Markdown",
  });
});

bot.action("remove_canvas", (ctx) => {
  ctx.answerCbQuery();
  ctx.reply(
    "⚠️ *Remove Canvas Integration*\n\n" +
      "This will delete your saved Canvas token.\n" +
      "Your existing assignments will remain.\n\n" +
      "Type `/removecanvas` to confirm.",
    { parse_mode: "Markdown" },
  );
});

bot.action("canvas_settings", (ctx) => {
  ctx.answerCbQuery();
  ctx.reply(
    "⚙️ *Canvas Settings*\n\n" +
      "`/setcanvas <token>` - Configure Canvas\n" +
      "`/sync` - Import assignments from Canvas\n" +
      "`/removecanvas` - Remove Canvas integration",
    { parse_mode: "Markdown" },
  );
});

// Register handlers
handleAddAssignment(bot);
handleListAssignments(bot);
handleDeleteAllAssignments(bot);
handleDeleteAssignment(bot);

//Canvas Integration
handleSetCanvasToken(bot);
handleSyncCanvas(bot);
handleRemoveCanvasToken(bot);

//optional
//startAutoSyncScheduler(bot);
// Start cron scheduler
startReminderScheduler(bot);

// Launch bot
bot.launch();
console.log("Bot running...");
