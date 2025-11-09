import { buildHotelEntityItem } from '#common/hotelEntity.helper.js';
import DDB from '#clients/DynamoDb.client.js';
import {
  ENTITY_TABLE_NAME,
  GSI_ACTIVE_NAME,
  GSI_BOOKINGTYPE_NAME,
  GSI_STATUS_NAME,
} from '#Constants/DB.constants.js';
import { ulid } from 'ulid';
import { decodeToken, encodeToken } from './repository.helper.js';
import { ActiveRequestStatuses, InActiveRequestStatuses } from '#Constants/statuses.constants.js';

export async function queryRequestsForBooking({ bookingId }) {
  if (!bookingId) {
    throw new Error('bookingId is required to query requests for booking');
  }

  const params = {
    TableName: ENTITY_TABLE_NAME,
    IndexName: GSI_BOOKINGTYPE_NAME,

    KeyConditionExpression: 'bookingType_pk = :pk and begins_with(bookingType_sk, :sk)',
    ExpressionAttributeValues: {
      ':pk': `BOOKING#${bookingId}`,
      ':sk': `REQUEST#`,
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
    console.error('Failed to query requests for booking:', err);
    throw new Error('Failed to query requests for booking');
  }
}

export async function createRequest(request) {
  const requestItem = buildHotelEntityItem(request);

  await DDB.put({
    TableName: ENTITY_TABLE_NAME,
    Item: requestItem,
    ConditionExpression: 'attribute_not_exists(pk) and attribute_not_exists(sk)',
  }).promise();

  return requestItem;
}

export async function queryRequestsByStatusType({
  hotelId,
  statusType,
  limit = 25,
  nextToken,
  roomId,
  bookingId,
  assignedStaffUserId,
}) {
  if (!hotelId || !statusType)
    throw new Error('hotelId and statusType needed to query requests by status');

  const params = {
    TableName: ENTITY_TABLE_NAME,
    IndexName: GSI_STATUS_NAME,
    KeyConditionExpression: '#pk = :pk',
    ExpressionAttributeNames: {
      '#pk': 'status_pk',
    },
    ExpressionAttributeValues: {
      ':pk': `REQSTATUS#${statusType.toUpperCase()}#HOTEL#${hotelId}`,
    },
    Limit: Math.min(Number(limit) || 25, 100),
    ScanIndexForward: false,
    ExclusiveStartKey: decodeToken(nextToken),
  };

  if (roomId) {
    params.FilterExpression = '#roomId = :roomId';
    params.ExpressionAttributeNames['#roomId'] = 'roomId';
    params.ExpressionAttributeValues[':roomId'] = roomId;
  }

  if (bookingId) {
    params.FilterExpression = '#bookingId = :bookingId';
    params.ExpressionAttributeNames['#bookingId'] = 'bookingId';
    params.ExpressionAttributeValues[':bookingId'] = bookingId;
  }

  if (assignedStaffUserId) {
    params.FilterExpression = '#assignedStaffUserId = :assignedStaffUserId';
    params.ExpressionAttributeNames['#assignedStaffUserId'] = 'assignedStaffUserId';
    params.ExpressionAttributeValues[':assignedStaffUserId'] = assignedStaffUserId;
  }

  const data = await DDB.query(params).promise();
  return {
    items: data.Items || [],
    nextToken: encodeToken(data.LastEvaluatedKey),
    count: data.Count || 0,
  };
}

export async function getRequestById(requestId, hotelId) {
  if (!requestId || !hotelId) return null;

  const params = {
    TableName: ENTITY_TABLE_NAME,
    IndexName: GSI_ACTIVE_NAME,
    KeyConditionExpression: '#pk = :pk and #sk = :sk',
    ExpressionAttributeNames: {
      '#pk': 'active_pk',
      '#sk': 'active_sk',
    },
    ExpressionAttributeValues: {
      ':pk': `HOTEL#${hotelId}`,
      ':sk': `REQUEST#${requestId}`,
    },
    Limit: 1,
  };

  const { Items } = await DDB.query(params).promise();
  if (!Items || Items.length === 0) return null;

  return Items[0];
}

export async function updateRequestStatusWithLog({
  request,
  toStatus,
  timeOfFulfillment,
  assignedStaffUserId,
  updatedByUserId,
  note,
  cancellationReason,
}) {
  if (!request || !toStatus || !updatedByUserId) {
    throw new Error('request, toStatus, updatedByUserId are required to update request status');
  }

  const fromStatus = request.status ?? 'UNKNOWN';

  // 2) Build atomic update + log write
  const nowIso = new Date().toISOString();
  const transitionId = ulid();
  const logSk = `REQUEST_TRANSITION#${transitionId}`;

  const statusType = ActiveRequestStatuses.includes(toStatus)
    ? 'ACTIVE'
    : InActiveRequestStatuses.includes(toStatus)
      ? 'INACTIVE'
      : 'UNKNOWN';

  const updateNames = {
    '#status': 'status',
    '#updatedAt': 'updatedAt',
    '#status_pk': 'status_pk',
    '#statusType': 'statusType',
  };

  const updateValues = {
    ':toStatus': toStatus,
    ':updatedAt': nowIso,
    ':status_pk': `REQSTATUS#${statusType}#HOTEL#${request.hotelId}`,
    ':statusType': statusType,
  };

  const updateExpressionFields = [
    '#status = :toStatus',
    '#updatedAt = :updatedAt',
    '#status_pk = :status_pk',
    '#statusType = :statusType',
  ];

  if (assignedStaffUserId) {
    updateNames['#assignedStaffUserId'] = 'assignedStaffUserId';
    updateValues[':assignedStaffUserId'] = assignedStaffUserId;
    updateExpressionFields.push('#assignedStaffUserId = :assignedStaffUserId');
  }

  // only add this when a value is provided (null is OK, undefined is not)
  if (timeOfFulfillment !== undefined) {
    updateNames['#timeOfFulfillment'] = 'timeOfFulfillment';
    updateValues[':timeOfFulfillment'] = timeOfFulfillment; // can be a string or null
    updateExpressionFields.push('#timeOfFulfillment = :timeOfFulfillment');
  }

  if (cancellationReason) {
    updateNames['#cancellationReason'] = 'cancellationReason';
    updateValues[':cancellationReason'] = cancellationReason;
    updateExpressionFields.push('#cancellationReason = :cancellationReason');
  }

  const transitionItem = {
    pk: request.sk,
    sk: logSk,

    active_pk: request.sk,
    active_sk: logSk,

    entityType: 'REQUEST_TRANSITION',
    requestId: request.requestId,
    transitionId,
    fromStatus,
    toStatus,
    note, // optional
    cancellationReason,
    updatedByUserId,
    createdAt: nowIso,
  };

  await DDB.transactWrite({
    TransactItems: [
      {
        Update: {
          TableName: ENTITY_TABLE_NAME,
          Key: { pk: request.pk, sk: request.sk },
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
  }).promise();

  return {
    requestId: request.requestId,
    fromStatus,
    toStatus,
    updatedAt: nowIso,
    transitionId,
  };
}
