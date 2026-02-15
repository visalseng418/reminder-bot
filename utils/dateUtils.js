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

function formatDuration(ms) {
  const totalMinutes = Math.floor(ms / (60 * 1000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours} hour(s) ${minutes} minute(s)`;
  }
  if (hours > 0) return `${hours} hour(s)`;
  return `${minutes} minute(s)`;
}

module.exports = { parseDate, formatDate, formatTime, formatDuration };
