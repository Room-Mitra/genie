import { ENTITY_TABLE_NAME, GSI_ROOMTYPE_NAME, GUEST_TABLE_NAME } from '#Constants/DB.constants.js';
import { buildHotelEntityItem } from '#common/hotelEntity.helper.js';
import { toIsoString } from '#common/timestamp.helper.js';
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
  const params = {
    TableName: ENTITY_TABLE_NAME,
    IndexName: GSI_ROOMTYPE_NAME,
    KeyConditionExpression: '#gpk = :gpk AND begins_with(#gsk, :bookingPrefix)',
    FilterExpression: '#checkInTime < :reqEnd AND #checkOutTime > :reqStart',
    ExpressionAttributeNames: {
      '#gpk': 'roomType_pk',
      '#gsk': 'roomType_sk',
      '#checkInTime': 'checkInTime',
      '#checkOutTime': 'checkOutTime',
    },
    ExpressionAttributeValues: {
      ':gpk': `ROOM#${roomId}`, // important prefix
      ':bookingPrefix': 'BOOKING#', // optional but narrows items on the index
      ':reqStart': checkInTime, // ISO strings compare lexicographically by time
      ':reqEnd': checkOutTime,
    },
    // Do NOT set Limit with a FilterExpression
    ProjectionExpression: '#checkInTime, #checkOutTime',
    ReturnConsumedCapacity: 'NONE',
  };

  let LastEvaluatedKey;
  do {
    const res = await DDB.query({ ...params, ExclusiveStartKey: LastEvaluatedKey }).promise();
    if (res.Items && res.Items.length > 0) return true; // Items are already filtered
    LastEvaluatedKey = res.LastEvaluatedKey;
  } while (LastEvaluatedKey);

  return false;
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

export async function queryBookings({ hotelId, status }) {
  if (!hotelId) {
    throw new Error('hotelId is required to query active bookings');
  }

  if (!['all', 'active', 'upcoming', 'past'].includes(status)) {
    throw new Error('status needs to be one of all, active, upcoming or past');
  }

  const filterExpressions = {
    active: 'checkOutTime > :now AND checkInTime < :now',
    upcoming: 'checkInTime > :now',
    past: 'checkOutTime < :now',
  };

  const params = {
    TableName: ENTITY_TABLE_NAME,

    KeyConditionExpression: 'pk = :pk and begins_with(sk, :sk)',
    FilterExpression: filterExpressions[status],
    ExpressionAttributeValues: {
      ':pk': `HOTEL#${hotelId}`,
      ':sk': `BOOKING#`,
      ':now': toIsoString(),
    },
    ScanIndexForward: false,
  };

  const items = [];
  let lastEvaluatedKey;

  try {
    do {
      const res = await DDB.query(params).promise();
      if (res.Items?.length) items.push(...res.Items);
      lastEvaluatedKey = res.LastEvaluatedKey;
      params.ExclusiveStartKey = lastEvaluatedKey;
    } while (lastEvaluatedKey);

    return items;
  } catch (err) {
    console.error('Failed to query active bookings:', err);
    throw new Error('Failed to query active bookings');
  }
}
