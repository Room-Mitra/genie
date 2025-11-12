import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";
import React from "react";

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

const normalizeSlots = (slots) =>
  (slots ?? []).map((s) => `${s.start} - ${s.end}`);

const sameSlotKey = (slots) => normalizeSlots(slots).join("|"); // stable key for equality

function buildRows(weeklyShifts) {
  const rows = [];

  let i = 0;
  while (i < DAY_ORDER.length) {
    const day = DAY_ORDER[i];
    const daySlots = weeklyShifts?.[day] ?? [];
    const key = sameSlotKey(daySlots);

    if (daySlots.length === 0) {
      i++;
      continue; // skip empty days
    }

    // Extend group while consecutive days have identical slots
    let j = i + 1;
    while (j < DAY_ORDER.length) {
      const next = DAY_ORDER[j];
      const nextKey = sameSlotKey(weeklyShifts?.[next] ?? []);
      if (nextKey !== key) break;
      j++;
    }

    // Day label or range label
    const startLabel = DAY_LABELS[DAY_ORDER[i]];
    const endLabel = DAY_LABELS[DAY_ORDER[j - 1]];
    const label = i === j - 1 ? startLabel : `${startLabel} - ${endLabel}`;

    rows.push({ label, slots: normalizeSlots(daySlots) });

    i = j; // jump to first day after this group
  }

  return rows;
}

export function ShiftSummary({ weeklyShifts, timezone = "Asia/Kolkata" }) {
  // Empty: no shifts configured
  if (!weeklyShifts || Object.keys(weeklyShifts).length === 0) {
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

  const onDutyNow = weeklyShifts.isOnShiftNow;

  const rows = buildRows(weeklyShifts);

  const colorClass = onDutyNow
    ? "text-emerald-600 dark:text-emerald-400"
    : "text-zinc-700 dark:text-zinc-200";

  const label = onDutyNow ? "On duty now" : "Off duty now";

  return (
    <div>
      <div className={cn("flex items-start gap-2 text-sm", colorClass)}>
        <Clock className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="font-medium">{label}</div>
      </div>

      <div className="grid grid-cols-[max-content,1fr] items-start gap-x-3 gap-y-1 text-left">
        {rows.map(({ label, slots }, idx) => (
          <React.Fragment key={idx}>
            <div className="whitespace-nowrap text-sm text-zinc-600">
              {label}
            </div>
            <div className="text-sm leading-5">
              {slots.map((t, j) => (
                <div className="font-medium tabular-nums" key={j}>
                  {t}
                </div>
              ))}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
