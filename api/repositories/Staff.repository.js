import { ENTITY_TABLE_NAME, GSI_HOTELTYPE_NAME } from '#Constants/DB.constants.js';
import { toIsoString } from '#common/timestamp.helper.js';
import { DDB, DDBV3 } from '#clients/DynamoDb.client.js';
import { HotelRoles } from '#Constants/roles.js';
import { ActiveDutyStatuses, InactiveDutyStatuses } from '#Constants/statuses.constants.js';
import { ulid } from 'ulid';
import { TransactWriteCommand } from '@aws-sdk/lib-dynamodb';

export async function addStaff({
  hotelId,
  userId,
  role,
  department,
  reportingToUserId,
  weeklyShifts,
}) {
  if (!userId) throw new Error('userId is required');
  if (!hotelId) throw new Error('hotelId is required');

  const pk = 'CATALOG#USER';
  const sk = `USER#${userId}`;
  const now = Date.now();
  const nowIso = toIsoString(now);

  const updateExpression = [
    'SET #roles = list_append(if_not_exists(#roles, :emptyList), :newRole)',
    'hotelType_pk = :hotelTypePk',
    'hotelType_sk = :hotelTypeSk',
    'hotelId = :hotelId',
    'updatedAt = :nowIso',
    'department = :department',
    'weeklyShifts = :weeklyShifts',
  ];

  const expressionAttributeValues = {
    ':hotelTypePk': `HOTEL#${hotelId}`,
    ':hotelTypeSk': `USER#${userId}`,
    ':hotelId': hotelId,
    ':nowIso': nowIso,
    ':newRole': [role],
    ':emptyList': [],
    ':roleVal': role,
    ':department': department,
    ':weeklyShifts': weeklyShifts,
  };

  if (reportingToUserId) {
    updateExpression.push('reportingToUserId = :reportingToUserId');
    expressionAttributeValues[':reportingToUserId'] = reportingToUserId;
  }

  const params = {
    TableName: ENTITY_TABLE_NAME,
    Key: { pk, sk }, // sk stays "USER#<ulid>"
    UpdateExpression: updateExpression.join(', '),
    ConditionExpression: 'attribute_not_exists(#roles) OR NOT contains(#roles, :roleVal)',
    ExpressionAttributeNames: {
      '#roles': 'roles',
    },
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW',
  };

  const { Attributes } = await DDB.update(params).promise();
  return Attributes;
}

export async function removeHotelFromUser({ user }) {
  if (!user) return;

  const key = { pk: 'CATALOG#USER', sk: `USER#${user.userId}` };

  const HOTEL_ROLES = new Set(HotelRoles);

  // 2) Compute filtered roles (retain non-hotel roles)
  const currentRoles = Array.isArray(user.roles) ? user.roles : [];
  const filteredRoles = currentRoles.filter((r) => !HOTEL_ROLES.has(r));

  // 3) Update: set hotel fields to null + roles + updatedAt
  const now = toIsoString();

  const params = {
    TableName: ENTITY_TABLE_NAME,
    Key: key,
    UpdateExpression: `
      SET 
        #roles = :roles,
        #updatedAt = :now
      REMOVE 
        #hotelType_pk, 
        #hotelType_sk, 
        #hotelId, 
        #department,
        #reportingToUserId  
    `,
    ExpressionAttributeNames: {
      '#roles': 'roles',
      '#hotelType_pk': 'hotelType_pk',
      '#hotelType_sk': 'hotelType_sk',
      '#hotelId': 'hotelId',
      '#department': 'department',
      '#updatedAt': 'updatedAt',
      '#reportingToUserId': 'reportingToUserId',
    },
    ExpressionAttributeValues: {
      ':roles': filteredRoles,
      ':now': now,
    },
    ConditionExpression: 'attribute_exists(pk) AND attribute_exists(sk)',
    ReturnValues: 'ALL_NEW',
  };

  try {
    const { Attributes } = await DDB.update(params).promise();
    return Attributes;
  } catch (err) {
    console.error('failed to remove hotel from user', err);
    throw new Error('failed to remove hotel from user');
  }
}

export async function queryStaffByHotelId(hotelId, reportingToUserId) {
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

  if (reportingToUserId) {
    params.FilterExpression = '#reportingToUserId = :reportingToUserId';
    params.ExpressionAttributeNames['#reportingToUserId'] = 'reportingToUserId';
    params.ExpressionAttributeValues[':reportingToUserId'] = reportingToUserId;
  }

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

export async function updateUserDutyStatus({ hotelId, user, toStatus, trigger, actor }) {
  if (!user || !hotelId || !toStatus)
    throw new Error('userId, hotelId, toStatus needed to update user duty status');

  const fromStatus = user.status ?? 'UNKNOWN';

  const nowIso = toIsoString();
  const transitionId = ulid();
  const logSk = `DUTY_TRANSITION#${transitionId}`;

  const statusType = ActiveDutyStatuses.includes(toStatus)
    ? 'ACTIVE'
    : InactiveDutyStatuses.includes(toStatus)
      ? 'INACTIVE'
      : 'UNKNOWN';

  const updateExpressionFields = [
    '#dutyStatus = :toStatus',
    '#updatedAt = :updatedAt',
    '#status_pk = :status_pk',
    '#dutyStatusType = :dutyStatusType',
  ];

  const updateNames = {
    '#dutyStatus': 'dutyStatus',
    '#updatedAt': 'updatedAt',
    '#status_pk': 'status_pk',
    '#dutyStatusType': 'dutyStatusType',
  };

  const updateValues = {
    ':toStatus': toStatus,
    ':updatedAt': nowIso,
    ':status_pk': `DUTY_STATUS#${statusType}#HOTEL#${hotelId}`,
    ':dutyStatusType': statusType,
  };

  const transitionItem = {
    pk: user.sk,
    sk: logSk,

    active_pk: user.sk,
    active_sk: logSk,

    entityType: 'DUTY_TRANSITION',
    userId: user.userId,
    transitionId,
    fromStatus,
    toStatus,

    trigger,
    actor,
    createdAt: nowIso,
  };

  await DDBV3.send(
    new TransactWriteCommand({
      TransactItems: [
        {
          Update: {
            TableName: ENTITY_TABLE_NAME,
            Key: { pk: user.pk, sk: user.sk },
            UpdateExpression: `SET ${updateExpressionFields.join(', ')}`,
            ExpressionAttributeNames: updateNames,
            ExpressionAttributeValues: updateValues,
            // ensure the main item exists
            ConditionExpression: 'attribute_exists(pk) AND attribute_exists(sk)',
          },
        },
        {
          Put: {
            TableName: ENTITY_TABLE_NAME,
            Item: transitionItem,
            // idempotency for this transition record
            ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
          },
        },
      ],
    })
  );

  return {
    userId: user.userId,
    fromStatus,
    toStatus,
    updatedAt: nowIso,
    transitionId,
  };
}

export async function updateUserLocation({ hotelId, user, lat, lng, radius, wifiSSID }) {
  if (!user || !hotelId || !lat || !lng || !radius)
    throw new Error('userId, hotelId, lat, lng, radius needed to update user location');

  const nowIso = toIsoString();
  const locationId = ulid();
  const locationSk = `LOCATION#${locationId}`;

  const updateExpressionFields = ['#updatedAt = :updatedAt', '#lastLocation = :lastLocation'];

  const updateNames = {
    '#updatedAt': 'updatedAt',
    '#lastLocation': 'lastLocation',
  };

  const updateValues = {
    ':updatedAt': nowIso,
    ':lastLocation': {
      lat,
      lng,
      radius,
      wifiSSID,
    },
  };

  const locationItem = {
    pk: user.sk,
    sk: locationSk,

    active_pk: user.sk,
    active_sk: locationSk,

    entityType: 'LOCATION',
    userId: user.userId,
    locationId,
    lat,
    lng,
    radius,
    wifiSSID,

    createdAt: nowIso,
  };

  await DDBV3.send(
    new TransactWriteCommand({
      TransactItems: [
        {
          Update: {
            TableName: ENTITY_TABLE_NAME,
            Key: { pk: user.pk, sk: user.sk },
            UpdateExpression: `SET ${updateExpressionFields.join(', ')}`,
            ExpressionAttributeNames: updateNames,
            ExpressionAttributeValues: updateValues,
            // ensure the main item exists
            ConditionExpression: 'attribute_exists(pk) AND attribute_exists(sk)',
          },
        },
        {
          Put: {
            TableName: ENTITY_TABLE_NAME,
            Item: locationItem,
            // idempotency for this transition record
            ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
          },
        },
      ],
    })
  );

  return {
    userId: user.userId,
    updatedAt: nowIso,
    locationId,
  };
}
