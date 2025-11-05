process.env.ENV === 'stage';

export const ENTITY_TABLE_NAME = process.env.ENV === 'prod' ? 'ENTITY' : 'ENTITY_STAGE';

export const GSI_ACTIVE_NAME = 'GSI_Active';

export const GSI_HOTELTYPE_NAME = 'GSI_HotelType';
export const GSI_ROOMTYPE_NAME = 'GSI_RoomType';
export const GSI_ASSIGNEEWORKLOAD_NAME = 'GSI_AssigneeWorkload';
export const GSI_STATUS_NAME = 'GSI_Status';
export const GSI_BOOKINGTYPE_NAME = 'GSI_BookingType';
