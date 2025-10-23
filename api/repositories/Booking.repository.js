import { ENTITY_TABLE_NAME, GSI_ROOMTYPE_NAME, GUEST_TABLE_NAME } from '#Constants/DB.constants.js';
import { buildHotelEntityItem } from '#common/hotelEntity.helper.js';
import DDB from '#config/DynamoDb.config.js';

const ID_TYPE = 'BOOKING:';

const addIdType = (booking) => {
  booking.id = `${ID_TYPE}${booking.id}`;
  return booking;
};

export const addBooking = async (bookingData) => {
  const params = {
    TableName: GUEST_TABLE_NAME,
    Item: { ...addIdType(bookingData) },
  };
  await DDB.put(params).promise(); // TODO :: Handle Error
  return params.Item;
};

export async function existsOverlappingBooking({ roomId, checkInTime, checkOutTime }) {
  // Overlap condition:
  // existing.start < requested.end AND existing.end > requested.start
  // Query by roomId where existing.start < requested.end
  const params = {
    TableName: ENTITY_TABLE_NAME,
    IndexName: GSI_ROOMTYPE_NAME,
    KeyConditionExpression: 'roomType_pk = :roomId',
    FilterExpression: '#checkOutTime > :requestedCheckin AND #checkInTime < :requestedCheckout',
    ExpressionAttributeNames: {
      '#checkInTime': 'checkInTime',
      '#checkOutTime': 'checkOutTime',
    },
    ExpressionAttributeValues: {
      ':roomId': roomId,
      ':requestedCheckout': checkOutTime,
      ':requestedCheckin': checkInTime,
    },
    Limit: 1, // we only need to know if one exists
  };

  const { Items } = await DDB.query(params).promise();
  return Items && Items.length > 0;
}

export async function createBooking(booking) {
  const bookingItem = buildHotelEntityItem(booking);

  await DDB.put({
    TableName: ENTITY_TABLE_NAME,
    Item: bookingItem,
    ConditionExpression: 'attribute_not_exists(pk)', // idempotency
  }).promise();

  return bookingItem;
}

export async function queryLatestBookingById({ hotelId, bookingId }) {
  const pk = `HOTEL#${hotelId}`;
  const sk = `BOOKING#${bookingId}`;

  const params = {
    TableName: ENTITY_TABLE_NAME,
    KeyConditionExpression: 'pk = :pk and sk = :sk',
    ExpressionAttributeValues: { ':pk': pk, ':sk': sk },
    ScanIndexForward: false,
    Limit: 1,
  };

  const data = await DDB.query(params).promise();
  return data.Items && data.Items[0];
}
