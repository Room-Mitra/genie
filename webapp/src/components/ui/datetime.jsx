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
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timePart = formatTime(date);
  return `${datePart}, ${timePart}`;
}

function formatDateTimeSmart(isoString) {
  const date = new Date(isoString);
  if (isNaN(+date)) return "";

  const now = new Date();
  const sodNow = startOfLocalDay(now);
  const sodDate = startOfLocalDay(date);

  const msPerDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.floor((sodNow - sodDate) / msPerDay);

  if (diffDays === -1) {
    return `Tomorrow, ${formatTime(date)}`;
  }

  if (diffDays === 0) {
    return `Today, ${formatTime(date)}`;
  }

  if (diffDays === 1) {
    return `Yesterday, ${formatTime(date)}`;
  }

  if (diffDays === 2) {
    return `2 days ago, ${formatTime(date)}`;
  }

  return formatFullDate(date);
}

export function DateTime({ dateTimeIso }) {
  return <span>{formatDateTimeSmart(dateTimeIso)}</span>;
}
