import { buildHotelEntityItem } from '#common/hotelEntity.helper.js';
import DDB from '#config/DynamoDb.config.js';
import { ENTITY_TABLE_NAME, GSI_HOTELTYPE_NAME } from '#Constants/DB.constants.js';
import { decodeToken } from './repository.helper.js';

export const createRoom = async (roomData) => {
  const roomItem = buildHotelEntityItem(roomData, { includeHotelTypeIndex: true });
  const params = {
    TableName: ENTITY_TABLE_NAME,
    Item: roomItem,
  };

  await DDB.put(params).promise();
  return params.Item;
};

// listRooms: fetch all rooms for a given hotel via GSI(hotelType_pk, hotelType_sk)
export async function queryAllRooms({ hotelId, limit, nextToken }) {
  if (!hotelId) {
    throw new Error('hotelId is required');
  }

  const params = {
    TableName: ENTITY_TABLE_NAME,
    IndexName: GSI_HOTELTYPE_NAME,
    // hotelType_pk = HOTEL#<hotelId>
    // hotelType_sk begins with ROOM#
    KeyConditionExpression: '#gpk = :gpk AND begins_with(#gsk, :gsk)',
    ExpressionAttributeNames: {
      '#gpk': 'hotelType_pk',
      '#gsk': 'hotelType_sk',
    },
    ExpressionAttributeValues: {
      ':gpk': `HOTEL#${hotelId}`,
      ':gsk': 'ROOM#',
    },
    Limit: Math.min(Number(limit) || 25, 100),
    ScanIndexForward: false,
    ExclusiveStartKey: decodeToken(nextToken),
  };

  const items = [];
  let lastEvaluatedKey;

  try {
    do {
      const res = await DDB.query(params).promise();
      if (res.Items && res.Items.length) items.push(...res.Items);
      lastEvaluatedKey = res.LastEvaluatedKey;
      params.ExclusiveStartKey = lastEvaluatedKey;
    } while (lastEvaluatedKey);

    return items;
  } catch (err) {
    console.error('Failed to list rooms:', err);
    throw new Error('Failed to list rooms');
  }
}

export async function queryRoomByPrefix({ hotelId, roomIdPrefix }) {
  const pk = `HOTEL#${hotelId}`;
  const sk = `ROOM#${roomIdPrefix.toUpperCase()}`;

  const params = {
    TableName: ENTITY_TABLE_NAME,
    KeyConditionExpression: 'pk = :pk and begins_with(sk, :sk)',
    ExpressionAttributeValues: { ':pk': pk, ':sk': sk },
    ScanIndexForward: false,
    Limit: 1,
  };

  const data = await DDB.query(params).promise();
  return data.Items && data.Items[0];
}
