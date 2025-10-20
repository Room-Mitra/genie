import { ENTITY_TABLE_NAME, GSI_HOTELTYPE_NAME } from '#Constants/DB.constants.js';
import { toIsoString } from '#common/timestamp.helper.js';
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
  if (!userId) throw new Error('userId is required');
  if (!hotelId) throw new Error('hotelId is required');

  const pk = 'CATALOG#USER';
  const sk = `USER#${userId}`;
  const now = Date.now();
  const nowIso = toIsoString(now);

  const params = {
    TableName: ENTITY_TABLE_NAME,
    Key: { pk, sk }, // sk stays "USER#<ulid>"
    UpdateExpression: [
      'SET #roles = list_append(if_not_exists(#roles, :emptyList), :newRole)',
      'hotelType_pk = :hotelTypePk',
      'hotelType_sk = :hotelTypeSk',
      'hotelId = :hotelId',
      'updatedAt = :nowIso',
    ].join(', '),
    ConditionExpression: 'attribute_not_exists(#roles) OR NOT contains(#roles, :roleVal)',
    ExpressionAttributeNames: {
      '#roles': 'roles',
    },
    ExpressionAttributeValues: {
      ':hotelTypePk': `HOTEL#${hotelId}`,
      ':hotelTypeSk': `USER#${userId}`,
      ':hotelId': hotelId,
      ':nowIso': nowIso,
      ':newRole': [role],
      ':emptyList': [],
      ':roleVal': role,
    },
    ReturnValues: 'ALL_NEW',
  };

  const { Attributes } = await DDB.update(params).promise();
  return Attributes;
}

export async function queryStaffByHotelId(hotelId, { limit = 25, nextToken } = {}) {
  const params = {
    TableName: ENTITY_TABLE_NAME,
    IndexName: GSI_HOTELTYPE_NAME,
    KeyConditionExpression: '#pk = :h AND begins_with(#sk, :pref)',
    ExpressionAttributeNames: {
      '#pk': 'hotelType_pk',
      '#sk': 'hotelType_sk',
    },
    ExpressionAttributeValues: {
      ':h': `HOTEL#${hotelId}`,
      ':pref': 'USER#',
    },
    Limit: Math.min(Number(limit) || 25, 100),
    ExclusiveStartKey: decodeToken(nextToken),
  };

  const out = await DDB.query(params).promise();
  return {
    items:
      out.Items?.map((i) => {
        return {
          entityType: i.entityType,
          roles: i.roles,
          userId: i.userId,
          createdAt: i.createdAt,
          name: i.name,
          email: i.email,
        };
      }) || [],
    nextToken: encodeToken(out.LastEvaluatedKey),
    count: out.Count || 0,
  };
}
