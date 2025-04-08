
const { addGuest: addGuestToDB, getGuest: getGuestFromDB, updateGuest: updateGuestInDB } = require("./Guest.repository")

const registerGuest = async (guest) => {
    addGuestToDB(guest);
}

const getGuestDetails = async (guestId) => {
    return getGuestFromDB(guestId);
}

const updateGuestData = async (guestId, guestData) => {
    await updateGuestInDB(guestId, guestData);
    console.log("GUEST RECORD UPDATED", guestId, guestData)
    return
}

const addBookingToGuest = async (guestId, bookingId) => {
    console.log("Adding Booking to Guest :: ", guestId)
    const guestData = await getGuestDetails(guestId);
    console.log("Guest Data :: ", guestData)
    guestData.bookings = guestData.bookings || [];
    guestData.bookings.push(bookingId);
    await updateGuestData(guestId, guestData);
}

module.exports = { registerGuest, getGuestDetails, updateGuestData, addBookingToGuest }