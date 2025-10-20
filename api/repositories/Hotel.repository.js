import { ENTITY_TABLE_NAME } from '#Constants/DB.constants.js';
import { buildHotelEntityItem } from '#common/hotelEntity.helper.js';
import DDB from '#config/DynamoDb.config.js';
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

/** Scan all hotels with FilterExpression on entityType = HOTEL */
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
