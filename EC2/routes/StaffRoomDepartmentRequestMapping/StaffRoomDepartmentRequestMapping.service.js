const { addMappingToDB, getMappingFromDB } = require('./StaffRoomDepartmentRequestMapping.repository.js');
const db = require('./StaffRoomDepartmentRequestMapping.repository.js'); // Example: Replace with your actual database module

/**
 * Registers a new staff-room-department mapping.
 * @param {Object} mappingData - The mapping details (staffId, roomId, departmentId).
 * @returns {Promise<Object>} - The saved mapping.
 */
async function registerStaffRoomDepartmentMapping(hotelId, mappingData) {
    try {
        const staffRoomDepartmentMapping = {
            id: hotelId,
            mappingData: mappingData
        }
        return addMappingToDB(staffRoomDepartmentMapping);
    } catch (error) {
        console.error('Error registering staff-room-department mapping:', error);
        throw error;
    }
}

/**
 * Retrieves all staff-room-department mappings.
 * @returns {Promise<Array>} - List of mappings.
 */
async function getStaffRoomDepartmentMappings(hotelId) {
    try {
        return await getMappingFromDB(hotelId);
    } catch (error) {
        console.error('Error fetching staff-room-department mappings:', error);
        throw error;
    }
}

module.exports = {
    registerStaffRoomDepartmentMapping,
    getStaffRoomDepartmentMappings,
};