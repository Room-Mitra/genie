import { ENTITY_TABLE_NAME, GSI_HOTELTYPE_NAME } from '#Constants/DB.constants.js';
import { toIsoString } from '#common/timestamp.helper.js';
import DDB from '#clients/DynamoDb.client.js';
import { decodeToken, encodeToken } from './repository.helper.js';

export async function addStaff({ hotelId, userId, role, department, reportingToUserId }) {
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
      'department = :department',
      'reportingToUserId = :reportingToUserId',
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
      ':department': department,
      ':reportingToUserId': reportingToUserId,
    },
    ReturnValues: 'ALL_NEW',
  };

  const { Attributes } = await DDB.update(params).promise();
  return Attributes;
}

export async function queryStaffByHotelId(hotelId) {
  if (!hotelId) {
    throw new Error('hotelId is required to query all staff for hotel');
  }

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
    console.error('Failed to list staff:', err);
    throw new Error('Failed to list staff');
  }
}
