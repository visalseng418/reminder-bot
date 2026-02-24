// bot/session.js
const { session } = require('telegraf');

// This allows ctx.session to work automatically in all handlers
module.exports = session();