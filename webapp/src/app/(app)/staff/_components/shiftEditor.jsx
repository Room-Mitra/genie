import { useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";

const WEEKDAY_KEYS = ["mon", "tue", "wed", "thu", "fri"];

const DAY_LABELS = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
];

export function StaffShiftEditor({
  value,
  onChange,
  timezone = "Asia/Kolkata",
}) {
  const weekly = useMemo(() => value || {}, [value]);

  const handleAddShift = (day) => {
    const current = weekly[day] ?? [];
    const newSlot = {
      id: crypto.randomUUID(),
      start: "09:00",
      end: "17:00",
    };

    const next = {
      ...weekly,
      [day]: [...current, newSlot],
    };

    onChange(next);
  };

  const handleUpdateShift = (day, id, field, newValue) => {
    const current = weekly[day] ?? [];
    const nextDaySlots = current.map((slot) =>
      slot.id === id ? { ...slot, [field]: newValue } : slot,
    );

    const next = {
      ...weekly,
      [day]: nextDaySlots,
    };

    onChange(next);
  };

  const handleRemoveShift = (day, id) => {
    const current = weekly[day] ?? [];
    const nextDaySlots = current.filter((slot) => slot.id !== id);

    const next = {
      ...weekly,
      [day]: nextDaySlots.length > 0 ? nextDaySlots : undefined,
    };

    onChange(next);
  };

  const hasAnyShifts = useMemo(
    () => DAY_LABELS.some((d) => (weekly[d.key] ?? []).length > 0),
    [weekly],
  );

  const handleCopyWeekdaysFromMonday = () => {
    const mondaySlots = weekly["mon"] ?? [];
    if (mondaySlots.length === 0) return;

    const next = { ...weekly };

    WEEKDAY_KEYS.forEach((day) => {
      if (day === "mon") return;
      next[day] = mondaySlots.map((slot) => ({
        ...slot,
        id: crypto.randomUUID(),
      }));
    });

    onChange(next);
  };

  return (
    <div className="bg-white shadow-sm dark:bg-gray-dark">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <span className="text-body-sm font-medium text-dark dark:text-white">
            Shift schedule
          </span>

          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Configure shift slots per day. Times are in{" "}
            <span className="font-medium">{timezone}</span>.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopyWeekdaysFromMonday}
          className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Copy Monday to weekdays
        </button>
      </div>

      <div className="space-y-3">
        {DAY_LABELS.map(({ key, label }) => {
          const slots = weekly[key] ?? [];

          return (
            <div
              key={key}
              className="rounded-lg border border-zinc-100 bg-zinc-50 p-3 dark:border-dark-3 dark:bg-dark-2"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500/70" />
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {label}
                  </span>
                  {slots.length === 0 && (
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      Off day
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleAddShift(key)}
                  className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  <Plus className="h-3 w-3" />
                  Add shift
                </button>
              </div>

              {slots.length > 0 && (
                <div className="space-y-2">
                  {slots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex flex-wrap items-center gap-2 rounded-md bg-white px-2 py-2 text-xs shadow-sm ring-1 ring-zinc-200 dark:bg-slate-900 dark:ring-zinc-700"
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-200">
                          Start
                        </span>
                        <input
                          type="time"
                          value={slot.start}
                          onChange={(e) =>
                            handleUpdateShift(
                              key,
                              slot.id,
                              "start",
                              e.target.value,
                            )
                          }
                          className="h-8 rounded-md border border-zinc-200 bg-zinc-50 px-2 text-xs text-zinc-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-gray-800 dark:text-zinc-100"
                        />
                      </div>

                      <span className="px-1 text-xs text-zinc-400">to</span>

                      <div className="flex items-center gap-1">
                        <span className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-200">
                          End
                        </span>
                        <input
                          type="time"
                          value={slot.end}
                          onChange={(e) =>
                            handleUpdateShift(
                              key,
                              slot.id,
                              "end",
                              e.target.value,
                            )
                          }
                          className="h-8 rounded-md border border-zinc-200 bg-zinc-50 px-2 text-xs text-zinc-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-gray-800 dark:text-zinc-100"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveShift(key, slot.id)}
                        className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-red-500 dark:hover:bg-zinc-800"
                        aria-label="Remove shift"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!hasAnyShifts && (
        <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-950 dark:text-amber-200">
          No shifts configured yet. Click{" "}
          <span className="font-semibold">Add shift</span> next to a day to
          start.
        </p>
      )}
    </div>
  );
}
