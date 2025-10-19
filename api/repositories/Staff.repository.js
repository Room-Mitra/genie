import { ENTITY_TABLE_NAME, GSI_HOTELID_ENTITY_TYPE_TS_NAME } from '#Constants/DB.constants.js';
import { buildHotelEntityItem } from '#common/hotelEntity.helper.js';
import DDB from '#config/DynamoDb.config.js';
import { decodeToken, encodeToken } from './repository.helper.js';

/**
 * Staff membership row (idempotent):
 *   pk = STAFF#USER#<userId>
 *   sk = STAFF#<ts>
 *   entityType = "STAFF"
 *   entityTypeTimestamp = "STAFF#<ISO>"
 *   hotelId (for your gsi_hotelId_entityTypeTs)
 *   userId
 *   role
 */

export async function addStaff({ userId, role = 'STAFF', hotelId }) {
  const staffId = `USER#${userId}`;
  const staff = {
    staffId,
    entityType: 'STAFF',
    userId,
    hotelId,
    role,
    status: 'ACTIVE',
  };

  const staffItem = buildHotelEntityItem(staff);

  const params = {
    TableName: ENTITY_TABLE_NAME,
    Item: {
      ...staffItem,
      sk: 'STAFF',
    },
    ConditionExpression: 'attribute_not_exists(pk) and attribute_not_exists(sk)',
  };

  await DDB.put(params).promise();
  return params.Item;
}

export async function queryStaffByHotelId(hotelId, { limit = 25, nextToken } = {}) {
  const params = {
    TableName: ENTITY_TABLE_NAME,
    IndexName: GSI_HOTELID_ENTITY_TYPE_TS_NAME,
    KeyConditionExpression: '#hid = :h AND begins_with(#etts, :pref)',
    ExpressionAttributeNames: {
      '#hid': 'hotelId',
      '#etts': 'entityTypeTimestamp',
    },
    ExpressionAttributeValues: {
      ':h': hotelId,
      ':pref': 'STAFF#',
    },
    Limit: Math.min(Number(limit) || 25, 100),
    ExclusiveStartKey: decodeToken(nextToken),
  };

  const out = await DDB.query(params).promise();
  return {
    items: out.Items || [],
    nextToken: encodeToken(out.LastEvaluatedKey),
    count: out.Count || 0,
  };
}
