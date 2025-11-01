function formatTime(date) {
  // e.g. "1:45 PM" (with space before AM/PM)
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function startOfLocalDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatFullDate(date) {
  // e.g. "23 Oct 2025, 9:00 AM"
  const datePart = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const timePart = formatTime(date);
  return `${datePart}, ${timePart}`;
}
  
function formatDateTimeSmart(isoString, withTime = true) {
  const date = new Date(isoString);
  if (isNaN(+date)) return "";

  const now = new Date();
  const sodNow = startOfLocalDay(now);
  const sodDate = startOfLocalDay(date);

  const msPerDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.floor((sodNow - sodDate) / msPerDay);

  if (diffDays === -1) {
    return withTime ? `Tomorrow, ${formatTime(date)}` : "Tomorrow";
  }

  if (diffDays === 0) {
    return withTime ? `Today, ${formatTime(date)}` : "Today";
  }

  if (diffDays === 1) {
    return withTime ? `Yesterday, ${formatTime(date)}` : "Yesterday";
  }

  if (diffDays === 2) {
    return withTime ? `2 days ago, ${formatTime(date)}` : "2 days ago";
  }

  return formatFullDate(date);
}

export function DateTime({ dateTimeIso }) {
  return (
    <span className="text-sm">{formatDateTimeSmart(dateTimeIso, true)}</span>
  );
}

export function DateOnly({ dateTimeIso }) {
  return (
    <span className="text-sm">{formatDateTimeSmart(dateTimeIso, false)}</span>
  );
}
