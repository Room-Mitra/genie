import dotenv from 'dotenv';
dotenv.config();

export const ENTITY_TABLE_NAME = process.env.ENTITY_TABLE_NAME;

export const GSI_ACTIVE_NAME = 'GSI_Active'; //active_pk, active_sk

export const GSI_HOTELTYPE_NAME = 'GSI_HotelType';
export const GSI_ROOMTYPE_NAME = 'GSI_RoomType';
export const GSI_ASSIGNEEWORKLOAD_NAME = 'GSI_AssigneeWorkload';
export const GSI_STATUS_NAME = 'GSI_Status'; // status_pk, status_sk
export const GSI_BOOKINGTYPE_NAME = 'GSI_BookingType';
