import { isOnShiftNow } from '#services/Staff.service.js';

export function weeklyShiftsResponse(weeklyShifts) {
  if (!weeklyShifts || Object.keys(weeklyShifts).length === 0) return null;

  const onShift = isOnShiftNow({ weeklyShifts });
  return {
    ...weeklyShifts,
    isOnShiftNow: onShift,
  };
}
