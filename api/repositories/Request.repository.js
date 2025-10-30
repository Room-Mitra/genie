import { buildHotelEntityItem } from '#common/hotelEntity.helper.js';
import DDB from '#clients/DynamoDb.client.js';
import { ENTITY_TABLE_NAME, GSI_BOOKINGTYPE_NAME } from '#Constants/DB.constants.js';
import { ulid } from 'ulid';
import { decodeToken, encodeToken } from './repository.helper.js';

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

export async function queryRequestsForHotel({ hotelId, statuses, limit = 25, nextToken }) {
  const params = {
    TableName: ENTITY_TABLE_NAME,
    KeyConditionExpression: 'pk = :pk and begins_with(sk, :sk)',
    ExpressionAttributeValues: {
      ':pk': `HOTEL#${hotelId}`,
      ':sk': 'REQUEST#',
    },
    Limit: Math.min(Number(limit) || 25, 100),
    ScanIndexForward: false,
    ExclusiveStartKey: decodeToken(nextToken),
  };

  if (statuses?.length) {
    const filterExpression = `#status IN (${statuses.map((_, i) => `:s${i}`).join(', ')})`;

    const expressionAttributeValues = statuses.reduce((acc, status, i) => {
      acc[`:s${i}`] = status;
      return acc;
    }, {});

    params.FilterExpression = filterExpression;
    params.ExpressionAttributeValues = {
      ...params.ExpressionAttributeValues,
      ...expressionAttributeValues,
    };
    params.ExpressionAttributeNames = {
      '#status': 'status',
    };
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
    Key: {
      pk: `HOTEL#${hotelId}`,
      sk: `REQUEST#${requestId}`,
    },
  };

  const { Item } = await DDB.get(params).promise();
  return Item || null;
}

export async function updateRequestStatusWithLog({
  request,
  toStatus,
  timeOfFulfillment,
  assignedStaffUserId,
  updatedByUserId,
  note,
}) {
  if (!request || !toStatus || !updatedByUserId) {
    throw new Error('request, toStatus, updatedByUserId are required');
  }

  const fromStatus = request.status ?? 'UNKNOWN';

  // 2) Build atomic update + log write
  const nowIso = new Date().toISOString();
  const transitionId = ulid();
  const logSk = `REQUEST_TRANSITION#${transitionId}`;

  const updateNames = {
    '#status': 'status',
    '#timeOfFulfillment': 'timeOfFulfillment',
    '#updatedAt': 'updatedAt',
  };

  const updateValues = {
    ':toStatus': toStatus,
    ':timeOfFulfillment': timeOfFulfillment,
    ':updatedAt': nowIso,
  };

  const updateExpressionFields = [
    '#status = :toStatus',
    '#timeOfFulfillment = :timeOfFulfillment',
    '#updatedAt = :updatedAt',
  ];

  if (assignedStaffUserId) {
    updateNames['#assignedStaffUserId'] = 'assignedStaffUserId';
    updateValues[':assignedStaffUserId'] = assignedStaffUserId;
    updateExpressionFields.push('#assignedStaffUserId = :assignedStaffUserId');
  }

  const transitionItem = {
    pk: request.sk,
    sk: logSk,
    entityType: 'REQUEST_TRANSITION',
    requestId: request.requestId,
    transitionId,
    fromStatus,
    toStatus,
    note, // optional
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
