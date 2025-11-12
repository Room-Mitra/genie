import { cn } from "@/lib/utils";
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

const DAY_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

function getDayKey(dt) {
  return dt.toFormat("ccc").toLowerCase().slice(0, 3);
}

function getTodayKey(timezone) {
  return getDayKey(DateTime.now().setZone(timezone));
}

function parseHM(hm) {
  const [h, m] = hm.split(":").map(Number);
  return { h, m };
}

/**
 * True if NOW (in the given timezone) falls within any shift window, including
 * spillover from yesterday's overnight slots.
 */
function isNowInShift(weekly, timezone = "Asia/Kolkata") {
  const now = DateTime.now().setZone(timezone);
  const todayStart = now.startOf("day");
  const yesterdayStart = todayStart.minus({ days: 1 });

  const todayKey = getDayKey(todayStart);
  const yesterdayKey = getDayKey(yesterdayStart);

  // 1) Check today's slots (normal or overnight starting today)
  const todayHit = (weekly[todayKey] ?? []).some((slot) => {
    const { h: sh, m: sm } = parseHM(slot.start);
    const { h: eh, m: em } = parseHM(slot.end);

    let start = todayStart.set({ hour: sh, minute: sm });
    let end = todayStart.set({ hour: eh, minute: em });

    // Overnight: end rolls into tomorrow
    if (end <= start) end = end.plus({ days: 1 });

    return now >= start && now <= end;
  });

  if (todayHit) return true;

  // 2) Check yesterday's overnight slots that spill into today
  const ydayHit = (weekly[yesterdayKey] ?? []).some((slot) => {
    const { h: sh, m: sm } = parseHM(slot.start);
    const { h: eh, m: em } = parseHM(slot.end);

    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    const isOvernight = endMin <= startMin;
    if (!isOvernight) return false;

    const start = yesterdayStart.set({ hour: sh, minute: sm });
    const end = yesterdayStart.set({ hour: eh, minute: em }).plus({ days: 1 });

    return now >= start && now <= end;
  });

  return ydayHit;
}

export function ShiftSummary({ weekly, timezone = "Asia/Kolkata" }) {
  // Empty: no shifts configured
  if (!weekly || Object.keys(weekly).length === 0) {
    return (
      <div className="flex items-start gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        <Clock className="mt-0.5 h-4 w-4" />
        <div>
          <div className="font-medium">Off</div>
          <div className="text-sm text-zinc-400 dark:text-zinc-400">
            No shifts configured
          </div>
        </div>
      </div>
    );
  }

  const todayKey = getTodayKey(timezone);
  const onDutyNow = isNowInShift(weekly, timezone);

  const getYesterdayKey = (tz) =>
    DateTime.now()
      .setZone(tz)
      .minus({ days: 1 })
      .toFormat("ccc")
      .toLowerCase()
      .slice(0, 3);

  const isOvernight = (start, end) => {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    return eh * 60 + em <= sh * 60 + sm;
  };

  // “Has shift today” if:
  // 1) any explicit slots today, OR
  // 2) any overnight slot yesterday that spills into today
  const hasShiftToday = (() => {
    const todaySlots = weekly[todayKey] ?? [];
    if (todaySlots.length > 0) return true;
    const yKey = getYesterdayKey(timezone);
    const ySlots = weekly[yKey] ?? [];
    return ySlots.some((slot) => isOvernight(slot.start, slot.end));
  })();

  // Build compact summary
  const weekdayKeys = ["mon", "tue", "wed", "thu", "fri"];
  const weekdaySlots = weekdayKeys
    .map((k) =>
      (weekly?.[k] ?? []).map((s) => `${s.start}-${s.end}`).join(", "),
    )
    .filter(Boolean);

  const uniqueWeekdaySlot =
    [...new Set(weekdaySlots)].length === 1 ? weekdaySlots[0] : null;

  let summaryLines = [];
  if (uniqueWeekdaySlot && weekdaySlots.length === 5) {
    summaryLines.push(`Mon–Fri ${uniqueWeekdaySlot}`);
    const sat = (weekly?.sat ?? [])
      .map((s) => `${s.start}-${s.end}`)
      .join(", ");
    const sun = (weekly?.sun ?? [])
      .map((s) => `${s.start}-${s.end}`)
      .join(", ");
    if (sat) summaryLines.push(`Sat ${sat}`);
    if (sun) summaryLines.push(`Sun ${sun}`);
  } else {
    summaryLines = DAY_ORDER.flatMap((day) => {
      const slots = weekly?.[day];
      if (!slots || slots.length === 0) return [];
      const s = slots.map((x) => `${x.start}-${x.end}`).join(", ");
      return `${DAY_LABELS[day]} ${s}`;
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
    <div className={cn("flex items-start gap-2 text-sm", colorClass)}>
      <Clock className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="flex flex-col gap-1 leading-tight">
        <div className="font-medium">{label}</div>
        <div className="flex max-w-[200px] flex-col gap-0.5 truncate text-xs opacity-80">
          {summaryLines.map((t, i) => (
            <div key={i}>{t}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
