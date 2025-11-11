import { REQUEST_DEPARTMENT_TO_STAFF_DEPARTMENTS } from '#Constants/department.constants.js';
import { MAX_LOAD_BY_ROLE, RolePriority } from '#Constants/roles.js';
import { userResponse } from '#presenters/user.js';
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

export function isOnShiftNow({
  weeklyShifts,
  now = DateTime.now(),
  hotelTimezone = 'Asia/Kolkata',
}) {
  if (!weeklyShifts) return false;

  // Convert "now" to hotel's local timezone
  const localNow = now.setZone(hotelTimezone);

  // Get lowercase 3-letter weekday key: mon, tue, wed, etc.
  const dayKey = localNow.toFormat('ccc').toLowerCase(); // "mon"

  const todayShifts = weeklyShifts[dayKey];
  if (!todayShifts || todayShifts.length === 0) return false;

  return todayShifts.some((shift) => {
    const shiftStart = DateTime.fromFormat(shift.start, 'HH:mm', { zone: hotelTimezone }).set({
      year: localNow.year,
      month: localNow.month,
      day: localNow.day,
    });

    const shiftEnd = DateTime.fromFormat(shift.end, 'HH:mm', { zone: hotelTimezone }).set({
      year: localNow.year,
      month: localNow.month,
      day: localNow.day,
    });

    return localNow >= shiftStart && localNow < shiftEnd;
  });
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
    // Optional: try escalation logic here (e.g., duty manager in front_office)
    return null;
  }

  // 4. Get workload per user
  const workloadByUser = await getActiveWorkloadByUser({ hotelId });

  // 5. Sort onDutyStaff:
  const sorted = sortOnDutyStaff(onDutyStaff, workloadByUser);
  const chosen = sorted[0];

  return chosen ? chosen.userId : null;
}

function getCurrentLoad(workloadByUser, userId) {
  return workloadByUser[userId] || 0;
}

function isUnderThreshold(user, workloadByUser) {
  const max = MAX_LOAD_BY_ROLE[user.operationalRole] ?? Infinity;
  const current = getCurrentLoad(workloadByUser, user.userId);
  return current < max;
}

function sortOnDutyStaff(onDutyStaff, workloadByUser) {
  // 1. Prefer people under their per role threshold
  const underThreshold = onDutyStaff.filter((u) => isUnderThreshold(u, workloadByUser));

  // If at least one person is under threshold, only pick from that pool
  const pool = underThreshold.length > 0 ? underThreshold : onDutyStaff;

  // 2. Sort pool:
  //    - by role priority (lowest role first)
  //    - then by workload (fewest active tasks)
  //    - then by userId as tie breaker
  const sorted = [...pool].sort((a, b) => {
    const roleDiff = RolePriority[a.operationalRole] - RolePriority[b.operationalRole];
    if (roleDiff !== 0) return roleDiff;

    const loadA = getCurrentLoad(workloadByUser, a.userId);
    const loadB = getCurrentLoad(workloadByUser, b.userId);
    if (loadA !== loadB) return loadA - loadB;

    return a.userId.localeCompare(b.userId);
  });

  return sorted;
}
