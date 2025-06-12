
const { addStaff: addStaffToDB,
    getStaff: getStaffFromDB,
    // updateStaff: updateStaffInDB, deleteStaff: deleteStaffInDB 
} = require("./Staff.repository")

const registerStaff = async (allStaffData, hotelId) => {
    const staffData = {
        id: hotelId,
        staffData: allStaffData
    }
    return addStaffToDB(staffData);
}

const getStaffDetails = async (hotelId) => {
    return getStaffFromDB(hotelId);
}

// const updateStaffData = async (guestId, guestData) => {
//     await updateStaffInDB(guestId, guestData);
//     console.log("STAFF RECORD UPDATED", guestId, guestData)
//     return
// }

// const deleteStaffData = async (guestId) => {
//     await deleteStaffInDB(guestId);
//     console.log("STAFF RECORD DELETED", guestId)
//     return
// }


module.exports = {
    registerStaff,
    getStaffDetails,
    // updateStaffData, deleteStaffData 
}