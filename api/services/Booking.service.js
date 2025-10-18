import { addBooking } from '#repositories/Booking.repository.js';
import { addBookingToGuest } from '#services/Guest.service.js';
import { addBookingToRoom } from '#services/Device.service.js';

export const registerBooking = async (bookingData) => {
  bookingData.id = `${bookingData.guestId}_${bookingData.roomId}_${bookingData.checkinTime}`;
  console.log('**************BOOKING ID ************', bookingData.id);
  await addBooking(bookingData);
  console.log('_________ADDED TO BOOKING DETAILS TO GUEST DB_________');
  await addBookingToGuest(bookingData.guestId, bookingData.id);
  console.log('_________ADDED TO BOOKING DETAILS TO GUEST DATA_________');

  await addBookingToRoom(bookingData.roomId, bookingData.id);

  console.log('Booking Data :: ', bookingData, 'added to repo');
};
