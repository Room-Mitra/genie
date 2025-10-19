export const DEVICES_TABLE_NAME = 'DEVICES'; // entire db is loaded to server cache
export const INTENTS_TABLE_NAME = 'INTENTS'; // pk = daysSinceEpoch, sk=requestedTime
export const GUEST_TABLE_NAME = 'GUEST'; // pk = guestId/bookingId

//  1) ENTITIES TABLE
//     Stores ROOM, HOTEL, USER, REQUEST, DEVICE, BOOKING, etc.
//     PK/SK allow single-table patterns.
//     hotelId GSI with SK entityType#timestamp
//     roomId GSI with SK entityType#timestamp (useful to fetch requests/bookings/devices by room)
//     "pk"     # e.g., HOTEL#<hotelId> or USER#<userId> or ROOM#<roomId>
//     "sk"     # e.g., ENTITY#<entityId> or REQUEST#<requestId> or META#<something>

export const ENTITY_TABLE_NAME = 'ENTITY';
