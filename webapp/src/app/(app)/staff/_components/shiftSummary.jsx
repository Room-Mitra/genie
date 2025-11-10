import { Clock } from "lucide-react";
import { DateTime } from "luxon";

const DAY_LABELS = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

function getTodayKey(timezone) {
  return DateTime.now()
    .setZone(timezone)
    .toFormat("ccc")
    .toLowerCase()
    .slice(0, 3);
}

function isNowInShift(weekly, timezone) {
  const now = DateTime.now().setZone(timezone);
  const today = getTodayKey(timezone);
  const slots = weekly[today] ?? [];
  const minutesNow = now.hour * 60 + now.minute;

  return slots.some((slot) => {
    const [sh, sm] = slot.start.split(":").map(Number);
    const [eh, em] = slot.end.split(":").map(Number);
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    return endMin >= startMin
      ? minutesNow >= startMin && minutesNow <= endMin
      : minutesNow >= startMin || minutesNow <= endMin; // overnight
  });
}

export function ShiftSummary({ weekly, timezone = "Asia/Kolkata" }) {
  if (!weekly || Object.keys(weekly).length === 0)
    return (
      <div className="flex items-start gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <Clock className="mt-0.5 h-3.5 w-3.5" />
        <div>
          <div className="font-medium">Off</div>
          <div className="text-[11px] text-zinc-400 dark:text-zinc-500">
            No shifts configured
          </div>
        </div>
      </div>
    );

  const todayKey = getTodayKey(timezone);
  const onDutyNow = isNowInShift(weekly, timezone);
  const hasShiftToday = (weekly[todayKey] ?? []).length > 0;

  const weekdayKeys = ["mon", "tue", "wed", "thu", "fri"];
  const weekdaySlots = weekdayKeys
    .map((k) => weekly?.[k]?.map((s) => `${s.start}-${s.end}`).join(", "))
    .filter(Boolean);

  const uniqueWeekdaySlot =
    [...new Set(weekdaySlots)].length === 1 ? weekdaySlots[0] : null;

  let summaryText = [];
  if (uniqueWeekdaySlot && weekdaySlots.length === 5) {
    summaryText.push(`Mon–Fri ${uniqueWeekdaySlot}`);
    const sat = weekly?.sat?.map((s) => `${s.start}-${s.end}`).join(", ");
    const sun = weekly?.sun?.map((s) => `${s.start}-${s.end}`).join(", ");
    if (sat) summaryText.push(`Sat ${sat}`);
    if (sun) summaryText.push(`Sun ${sun}`);
  } else {
    summaryText = Object.entries(weekly).map(([d, slots]) => {
      const s = (slots ?? []).map((x) => `${x.start}-${x.end}`).join(", ");
      return `${DAY_LABELS[d]} ${s}`;
    });
  }

  const colorClass = onDutyNow
    ? "text-emerald-600 dark:text-emerald-400"
    : hasShiftToday
      ? "text-zinc-700 dark:text-zinc-200"
      : "text-zinc-400 dark:text-zinc-500";

  const label = onDutyNow
    ? "On duty now"
    : hasShiftToday
      ? "Off duty now"
      : "Off today";

  return (
    <div className={`flex items-start gap-2 text-xs ${colorClass}`}>
      <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <div className="flex flex-col gap-1 leading-tight">
        <div className="font-medium">{label}</div>
        <div className="flex max-w-[180px] flex-col gap-1 truncate text-[11px] opacity-80">
          {summaryText.map((t, i) => (
            <div key={i}>{t}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
