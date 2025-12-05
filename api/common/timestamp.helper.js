/** Normalize to ISO string for lexicographic sort (helper if needed) */
export function toIsoString(input) {
  if (!input) return new Date().toISOString();
  if (typeof input === 'number') return new Date(input).toISOString();
  if (input instanceof Date) return input.toISOString();
  return new Date(input).toISOString();
}

export function minutesAhead(scheduledAt) {
  const now = new Date();
  const scheduled = new Date(scheduledAt);
  const diffMs = scheduled - now;
  return Math.floor(diffMs / 60000); // convert ms → minutes
}

export function formatTimestamp(ts) {
  return new Date(ts).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
