import {
  addMappingToDB,
  getMappingFromDB,
} from '#repositories/StaffRoomDepartmentRequestMapping.repository.js';

export async function registerStaffRoomDepartmentMapping(hotelId, mappingData) {
  try {
    const staffRoomDepartmentMapping = {
      id: hotelId,
      mappingData: mappingData,
    };
    return addMappingToDB(staffRoomDepartmentMapping);
  } catch (error) {
    console.error('Error registering staff-room-department mapping:', error);
    throw error;
  }
}

export async function getStaffRoomDepartmentMappings(hotelId) {
  try {
    return await getMappingFromDB(hotelId);
  } catch (error) {
    console.error('Error fetching staff-room-department mappings:', error);
    throw error;
  }
}

export async function getMappingByRoomAndDepartment(hotelId, roomId, department) {
  const { mappingData } = await getStaffRoomDepartmentMappings(hotelId);
  const roomMapping =
    (mappingData &&
      roomId &&
      mappingData.filter(
        (mapping) => mapping && mapping.rooms && mapping.rooms.toLocaleString().includes(roomId)
      )) ||
    [];
  const departmentMapping =
    (department &&
      roomMapping.filter(
        (mapping) => mapping && mapping.requestType && mapping.requestType === department
      )) ||
    [];

  return departmentMapping.filter((m) => m.isActive) || [];
}
