import { ENTITY_TABLE_NAME } from '#Constants/DB.constants.js';
import { buildHotelEntityItem } from '#common/hotelEntity.helper.js';
import DDB from '#clients/DynamoDb.client.js';
import { decodeToken, encodeToken } from './repository.helper.js';

/**
 * Writes a Hotel entity.
 * Uses a conditional put so we do not overwrite an existing item accidentally.
 * Expects `hotel` to be a plain JS object with keys created in the service.
 */
export async function putHotel(hotel) {
  const hotelItem = buildHotelEntityItem(hotel);

  const params = {
    TransactItems: [
      {
        Put: {
          TableName: ENTITY_TABLE_NAME,
          Item: hotelItem,
          ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(entityTypeTs)',
        },
      },
    ],
  };

  try {
    await DDB.transactWrite(params).promise();
  } catch (err) {
    // Bubble up a clearer message on conditional failures
    if (err && err.code === 'ConditionalCheckFailedException') {
      throw new Error('Hotel already exists with the same keys');
    }
    throw err;
  }
}

export async function queryAllHotels({ limit = 25, nextToken }) {
  const params = {
    TableName: ENTITY_TABLE_NAME,
    KeyConditionExpression: '#pk = :p',
    ExpressionAttributeNames: { '#pk': 'pk' },
    ExpressionAttributeValues: { ':p': 'CATALOG#HOTEL' },
    Limit: Math.min(Number(limit) || 25, 100),
    ScanIndexForward: false,
    ExclusiveStartKey: decodeToken(nextToken),
  };

  const data = await DDB.query(params).promise();
  return {
    items: data.Items || [],
    nextToken: encodeToken(data.LastEvaluatedKey),
    count: data.Count || 0,
  };
}

/** Query latest version of a hotel by id using pk and time-based sk */
export async function queryLatestHotelById(hotelId) {
  const pk = `CATALOG#HOTEL`;
  const sk = `HOTEL#${hotelId}`;

  const params = {
    TableName: ENTITY_TABLE_NAME,
    KeyConditionExpression: '#pk = :pk and #sk = :sk',
    ExpressionAttributeNames: { '#pk': 'pk', '#sk': 'sk' },
    ExpressionAttributeValues: { ':pk': pk, ':sk': sk },
    ScanIndexForward: false, // newest first
    Limit: 1,
  };

  const data = await DDB.query(params).promise();
  return data.Items && data.Items[0];
}

/** Update specific fields on a concrete pk/sk row */
export async function updateHotelByPkSk(pk, sk, updates) {
  const nowIso = new Date().toISOString();

  const names = { '#ua': 'updatedAt' };
  const values = { ':ua': nowIso };
  const sets = ['#ua = :ua'];

  let i = 0;
  for (const [k, v] of Object.entries(updates)) {
    i += 1;
    const nk = `#f${i}`;
    const vk = `:v${i}`;
    names[nk] = k;
    values[vk] = v;
    sets.push(`${nk} = ${vk}`);
  }

  const params = {
    TableName: ENTITY_TABLE_NAME,
    Key: { pk, sk },
    UpdateExpression: `SET ${sets.join(', ')}`,
    ExpressionAttributeNames: names,
    ExpressionAttributeValues: values,
    ConditionExpression: 'attribute_exists(pk) AND attribute_exists(sk)',
    ReturnValues: 'ALL_NEW',
  };

  const data = await DDB.update(params).promise();
  return data.Attributes;
}

export async function queryLatestHotelByPrefix(hotelIdPrefix) {
  const pk = `CATALOG#HOTEL`;
  const sk = `HOTEL#${hotelIdPrefix.toUpperCase()}`;

  const params = {
    TableName: ENTITY_TABLE_NAME,
    KeyConditionExpression: 'pk = :pk and begins_with(sk, :sk)',
    ExpressionAttributeValues: { ':pk': pk, ':sk': sk },
    ScanIndexForward: false, // newest first
    Limit: 1,
  };

  const data = await DDB.query(params).promise();
  return data.Items && data.Items[0];
}

export async function putAmenityOrConcierge(amenity) {
  const amenityItem = buildHotelEntityItem(amenity);
  const params = {
    TableName: ENTITY_TABLE_NAME,
    Item: amenityItem,
  };

  await DDB.put(params).promise();
  return params.Item;
}

export async function queryAllAmenitiesOrConcierge({ hotelId, entityType }) {
  if (!hotelId) {
    throw new Error('hotelId is required to query all amenities for hotel');
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
      ':sk': `HOTEL#META#${entityType}#`,
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
    console.error('Failed to list amenities / concierge services:', err);
    throw new Error('Failed to list amenities / concierge services');
  }
}

export async function deleteAmenityOrConcierge({ hotelId, id, entityType }) {
  if (!hotelId || !id || !entityType) return null;

  const params = {
    TableName: ENTITY_TABLE_NAME,
    Key: {
      pk: `HOTEL#${hotelId}`,
      sk: `HOTEL#META#${entityType}#${id}`,
    },
  };

  try {
    await DDB.delete(params).promise();
  } catch (err) {
    console.error('Failed to delete amenity / concierge service', err);
    throw new Error('Failed to delete amenity / concierge service');
  }
}
