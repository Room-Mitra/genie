
const { addStaff: addStaffToDB, getStaff: getStaffFromDB, updateStaff: updateStaffInDB, deleteStaff: deleteStaffInDB } = require("./Staff.repository")

const registerStaff = async (guest) => {
    addStaffToDB(guest);
}

const getStaffDetails = async (guestId) => {
    return getStaffFromDB(guestId);
}

const updateStaffData = async (guestId, guestData) => {
    await updateStaffInDB(guestId, guestData);
    console.log("STAFF RECORD UPDATED", guestId, guestData)
    return
}

const deleteStaffData = async (guestId) => {
    await deleteStaffInDB(guestId);
    console.log("STAFF RECORD DELETED", guestId)
    return
}


module.exports = { registerStaff, getStaffDetails, updateStaffData, deleteStaffData }