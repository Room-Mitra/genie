
const { addGuest: addGuestToDB, getGuest: getGuestFromDB, updateGuest: updateGuestInDB } = require("./Guest.repository")

const registerGuest = async (guest) => {
    addGuestToDB(guest);
}

const getGuestDetails = async (guestId) => {
    return getGuestFromDB(guestId);
}

const updateGuestData = async (guestId, guestData) => {
    updateGuestInDB(guestId, guestData);
}

const addBookingToGuest = async (guestId, bookingId) => {
    const guestData = getGuestDetails(guestId);
    guestData.bookings = guestData.bookings || [];
    guestData.bookings.push(bookingId);
    updateGuestData(guestId, guestData);
}

module.exports = { registerGuest, getGuestDetails, updateGuestData, addBookingToGuest }