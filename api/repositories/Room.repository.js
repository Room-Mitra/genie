import { buildHotelEntityItem } from '#common/hotelEntity.helper.js';
import DDB from '#clients/DynamoDb.client.js';
import { ENTITY_TABLE_NAME } from '#Constants/DB.constants.js';

export const createRoom = async (roomData) => {
  const roomItem = buildHotelEntityItem(roomData);
  const params = {
    TableName: ENTITY_TABLE_NAME,
    Item: roomItem,
  };

  await DDB.put(params).promise();
  return params.Item;
};

// listRooms: fetch all rooms for a given hotel via GSI(hotelType_pk, hotelType_sk)
export async function queryAllRooms({ hotelId }) {
  if (!hotelId) {
    throw new Error('hotelId is required to query all rooms for hotel');
  }

  const params = {
    TableName: ENTITY_TABLE_NAME,
    KeyConditionExpression: '#pk = :pk AND begins_with(#sk, :sk)',
    ExpressionAttributeNames: {
      '#pk': 'pk',
      '#sk': 'sk',
    },
    ExpressionAttributeValues: {
      ':pk': `HOTEL#${hotelId}`,
      ':sk': 'ROOM#',
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
