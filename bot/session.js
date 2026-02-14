const sessions = {};

function getSession(chatId) {
  if (!sessions[chatId]) sessions[chatId] = {};
  return sessions[chatId];
}

function clearSession(chatId) {
  delete sessions[chatId];
}

module.exports = { getSession, clearSession };
