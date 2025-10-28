//  1) ENTITIES TABLE
//     Stores ROOM, HOTEL, USER, REQUEST, DEVICE, BOOKING, etc.
//     PK/SK allow single-table patterns.
//     hotelId GSI with SK entityType#timestamp
//     roomId GSI with SK entityType#timestamp (useful to fetch requests/bookings/devices by room)
//     "pk"     # e.g., HOTEL#<hotelId> or USER#<userId> or ROOM#<roomId>
//     "sk"     # e.g., ENTITY#<entityId> or REQUEST#<requestId> or META#<something>

export const ENTITY_TABLE_NAME = 'ENTITY';

export const GSI_HOTELTYPE_NAME = 'GSI_HotelType';
export const GSI_ROOMTYPE_NAME = 'GSI_RoomType';
export const GSI_ASSIGNEEWORKLOAD_NAME = 'GSI_AssigneeWorkload';
export const GSI_REQUESTSTATUS_NAME = 'GSI_RequestStatus';
export const GSI_BOOKINGTYPE_NAME = 'GSI_BookingType';
export const GSI_CONVERSATIONMESSAGE_NAME = 'GSI_ConversationMessage';
