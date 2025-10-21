import { addBooking } from '#repositories/Booking.repository.js';
import { addBookingToGuest } from '#services/Guest.service.js';
import { addBookingToRoom } from '#services/Device.service.js';

export const registerBooking = async (bookingData) => {
  bookingData.id = `${bookingData.guestId}_${bookingData.roomId}_${bookingData.checkinTime}`;
  await addBooking(bookingData);
  await addBookingToGuest(bookingData.guestId, bookingData.id);
  await addBookingToRoom(bookingData.roomId, bookingData.id);
};
