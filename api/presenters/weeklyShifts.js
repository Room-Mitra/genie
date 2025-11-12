import { isOnShiftNow } from '#services/Staff.service.js';

export function weeklyShiftsResponse(weeklyShifts) {
  if (!weeklyShifts) return null;

  const onShift = isOnShiftNow({ weeklyShifts });
  return {
    ...weeklyShifts,
    isOnShiftNow: onShift,
  };
}
