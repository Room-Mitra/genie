import { REQUEST_DEPARTMENT_TO_STAFF_DEPARTMENTS } from '#Constants/department.constants.js';
import { MAX_LOAD_BY_ROLE, RolePriority } from '#Constants/roles.js';
import { RequestStatus } from '#Constants/statuses.constants.js';
import { userResponse } from '#presenters/user.js';
import { queryRequestsByStatusType } from '#repositories/Request.repository.js';
import * as staffRepo from '#repositories/Staff.repository.js';
import { getUserProfileById, updateUser } from '#repositories/User.repository.js';
import { getActiveWorkloadByUser } from './Request.service.js';
import { updatePassword } from './User.service.js';
import { DateTime } from 'luxon';

export const listStaffForHotel = async (hotelId) => {
  const staff = await staffRepo.queryStaffByHotelId(hotelId);

  return {
    items: staff.map(userResponse),
    count: staff.length || 0,
  };
};

export async function resetStaffPassword({ hotelId, staffUserId, password }) {
  if (!hotelId || !staffUserId || !password)
    throw new Error('need hotelId, staffUserId and password to reset password');

  const user = await getUserProfileById(staffUserId);
  if (!user) throw new Error('user not found');

  if (user.hotelId != hotelId)
    throw new Error(`cannot change password of user that doesn't belong to hotel`);

  await updatePassword(staffUserId, password);
}

const ALLOWED_UPDATE_FIELDS = [
  'firstName',
  'lastName',
  'mobileNumber',
  'department',
  'roles',
  'weeklyShifts',
  'reportingToUserId',
];

export async function updateStaffById(staffUserId, payload) {
  const updates = {};
  for (const f of ALLOWED_UPDATE_FIELDS) {
    if (payload[f] !== undefined) updates[f] = payload[f];
  }
  if (Object.keys(updates).length === 0) {
    const err = new Error('no updatable fields provided');
    err.status = 400;
    throw err;
  }

  const current = await getUserProfileById(staffUserId);
  if (!current) {
    const err = new Error('staff user not found');
    err.status = 404;
    throw err;
  }

  const updated = await updateUser(staffUserId, updates);
  return updated;
}

/** Return "mon"/"tue"/... for a given DateTime (hotel-local). */
function dayKeyOf(dt) {
  return dt.toFormat('ccc').toLowerCase();
}

/** Materialize a shift (HH:mm → DateTime) anchored on a specific calendar day. Handles overnight by rolling end to next day if needed. */
function materializeShift(anchor, s, zone) {
  const start = DateTime.fromFormat(s.start, 'HH:mm', { zone }).set({
    year: anchor.year,
    month: anchor.month,
    day: anchor.day,
  });
  let end = DateTime.fromFormat(s.end, 'HH:mm', { zone }).set({
    year: anchor.year,
    month: anchor.month,
    day: anchor.day,
  });
  if (end <= start) end = end.plus({ days: 1 }); // overnight
  return { start, end };
}

/**
 * Compute the CURRENT (active) shift window [start, end) for a user at `now`.
 * Looks at today's shifts and yesterday's overnight shifts.
 * Returns null if the user is not currently in any shift window.
 */
function currentShiftWindowForUser(weeklyShifts, now, zone) {
  if (!weeklyShifts) return null;

  const localNow = now.setZone(zone);
  const todayKey = dayKeyOf(localNow);
  const yesterday = localNow.minus({ days: 1 });
  const yesterdayKey = dayKeyOf(yesterday);

  const todayShifts = weeklyShifts[todayKey] ?? [];
  const yesterdayShifts = weeklyShifts[yesterdayKey] ?? [];

  // 1) Check today's shifts (including those that roll past midnight)
  for (const s of todayShifts) {
    const { start, end } = materializeShift(localNow, s, zone);
    if (localNow >= start && localNow < end) return { start, end };
  }

  // 2) Check yesterday's shifts that spill into today
  for (const s of yesterdayShifts) {
    const { start, end } = materializeShift(yesterday, s, zone);
    // Only relevant if it crosses midnight into today
    if (end.day !== start.day || end.diff(start, 'hours').hours > 20) {
      if (localNow >= start && localNow < end) return { start, end };
    }
  }

  return null;
}

/**
 * Build a map userId -> number of completed requests within THEIR current shift window.
 * Pass ~48h of pastRequests to cover overnight windows safely.
 */
export function handledInWindowByUser({
  users,
  pastRequests,
  hotelTimezone = 'Asia/Kolkata',
  now = DateTime.now(),
}) {
  const localNow = now.setZone(hotelTimezone);

  // Precompute each user's active window
  const windowByUser = {};
  for (const u of users) {
    windowByUser[u.userId] = currentShiftWindowForUser(u.weeklyShifts, localNow, hotelTimezone);
  }

  // Initialize counts
  const counts = {};
  for (const u of users) counts[u.userId] = 0;

  // Count requests that fall within each user's active window
  for (const req of pastRequests) {
    const uid = req.assignedStaffUserId;
    if (!uid) continue;

    const win = windowByUser[uid];
    if (!win) continue; // user not currently in a shift

    const tsRaw = req.timeOfFulfillment;
    if (!tsRaw) continue;

    const ts =
      tsRaw instanceof Date
        ? DateTime.fromJSDate(tsRaw, { zone: hotelTimezone })
        : DateTime.fromISO(String(tsRaw), { zone: hotelTimezone });

    if (!ts.isValid) continue;

    if (ts >= win.start && ts < win.end) {
      counts[uid] = (counts[uid] || 0) + 1;
    }
  }

  return counts;
}

export function isOnShiftNow({
  weeklyShifts,
  now = DateTime.now(),
  hotelTimezone = 'Asia/Kolkata',
}) {
  if (!weeklyShifts) return false;

  const localNow = now.setZone(hotelTimezone);

  const todayKey = dayKeyOf(localNow);
  const yesterday = localNow.minus({ days: 1 });
  const yesterdayKey = dayKeyOf(yesterday);

  const todayShifts = weeklyShifts[todayKey] ?? [];
  const yesterdayShifts = weeklyShifts[yesterdayKey] ?? [];

  // 1) Check today's shifts (including those that end after midnight)
  for (const s of todayShifts) {
    const { start, end } = materializeShift(localNow, s, hotelTimezone);
    if (localNow >= start && localNow < end) return true;
  }

  // 2) Check yesterday's overnight shifts that spill into today
  for (const s of yesterdayShifts) {
    const { start, end } = materializeShift(yesterday, s, hotelTimezone);
    // Only matters if it actually crosses midnight into today
    if (end > start && end.day !== start.day) {
      if (localNow >= start && localNow < end) return true;
    }
  }

  return false;
}

export async function getAvailableStaff(request, hotelTimezone = 'Asia/Kolkata') {
  const { hotelId, department: requestDept } = request;

  // 1. Map request department -> staff departments
  const staffDepartments = REQUEST_DEPARTMENT_TO_STAFF_DEPARTMENTS[requestDept] || [requestDept];

  // 2. Load all staff for this hotel & these departments
  const staff = await listStaffForHotel(hotelId);

  if (!staff || staff.count === 0) {
    return null; // no staff to assign to
  }

  // 3. Filter staff on duty right now
  const onDutyStaff = staff.items
    .filter((user) => staffDepartments.includes(user.department))
    .filter((user) => isOnShiftNow({ weeklyShifts: user.weeklyShifts, hotelTimezone }));

  if (onDutyStaff.length === 0) {
    return null;
  }

  // 4. Get workload per user
  const workloadByUser = await getActiveWorkloadByUser({ hotelId });

  // 5. Get request in past 48 hours
  const pastRequests = await queryRequestsByStatusType({
    hotelId,
    statusType: 'INACTIVE',
    statuses: [RequestStatus.COMPLETED],
    cutOffDate: DateTime.now().minus({ days: 2 }).startOf('day').toISO(),
    limit: 500,
  });

  // 6. Sort onDutyStaff:
  const sorted = sortOnDutyStaff(onDutyStaff, workloadByUser, pastRequests.items || []);
  const chosen = sorted[0];

  return chosen ? chosen.userId : null;
}

function isUnderThreshold(user, workloadByUser) {
  const max = MAX_LOAD_BY_ROLE[user?.roles?.[0]] ?? Infinity;
  const current = workloadByUser[user.userId] || 0;
  return current < max;
}

function sortOnDutyStaff(onDutyStaff, workloadByUser, pastRequests) {
  // 1. Prefer people under their per role threshold
  const underThreshold = onDutyStaff.filter((u) => isUnderThreshold(u, workloadByUser));

  // If at least one person is under threshold, only pick from that pool
  const pool = underThreshold.length > 0 ? underThreshold : onDutyStaff;

  // 2. For even distribution of work, get previous workload of staff for current shift
  const handled = handledInWindowByUser({
    users: onDutyStaff,
    pastRequests,
  });

  // 3. Sort pool:
  //    - by role priority (lowest role first)
  //    - then by workload (fewest active tasks)
  //    - then by previous workload
  //    - then by userId as tie breaker
  const sorted = [...pool].sort((a, b) => {
    const roleA = a?.roles?.[0];
    const roleB = b?.roles?.[0];

    // 1. When someone is under threshold, we still care about role first
    if (underThreshold.length > 0) {
      const roleDiff = RolePriority[roleA] - RolePriority[roleB];
      if (roleDiff !== 0) return roleDiff;
    }

    // 2. Active workload
    const loadA = workloadByUser[a.userId] || 0;
    const loadB = workloadByUser[b.userId] || 0;
    if (loadA !== loadB) return loadA - loadB;

    // 3. Previous workload handled in shift
    const handledA = handled[a.userId] || 0;
    const handledB = handled[b.userId] || 0;
    if (handledA !== handledB) return handledA - handledB;

    // 4. Tie-breaker
    return a.userId.localeCompare(b.userId);
  });

  return sorted;
}
