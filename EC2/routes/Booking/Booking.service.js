const { addBooking } = require("./Booking.repository.js");
const { addBookingToGuest } = require("../Guest/Guest.service.js");
const { addBookingToRoom } = require("../Device/Device.service.js");
const registerBooking = async (bookingData) => {
    bookingData.id = `${bookingData.guestId}_${bookingData.roomId}_${bookingData.checkinTime}`;
    console.log("**************BOOKING ID ************", bookingData.id)
    await addBooking(bookingData);
    console.log("_________ADDED TO BOOKING DETAILS TO GUEST DB_________")
    await addBookingToGuest(bookingData.guestId, bookingData.id)
    console.log("_________ADDED TO BOOKING DETAILS TO GUEST DATA_________")

    await addBookingToRoom(bookingData.roomId, bookingData.id)

    console.log("Booking Data :: ", bookingData, "added to repo")
}

module.exports = { registerBooking }
