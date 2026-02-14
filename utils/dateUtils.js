function parseDate(input) {
  const date = new Date(input);
  return isNaN(date.getTime()) ? null : date.getTime();
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

module.exports = { parseDate, formatDate, formatTime };
