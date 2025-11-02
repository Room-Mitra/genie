import DDB from '#clients/DynamoDb.client.js';
import { buildHotelEntityItem } from '#common/hotelEntity.helper.js';
import { ENTITY_TABLE_NAME, GSI_STATUS_NAME } from '#Constants/DB.constants.js';
import { decodeToken, encodeToken } from './repository.helper.js';

export async function createOrder({ order }) {
  const orderEntity = buildHotelEntityItem(order);

  const params = {
    TableName: ENTITY_TABLE_NAME,
    Item: orderEntity,
    ConditionExpression: 'attribute_not_exists(pk) and attribute_not_exists(sk)',
  };

  await DDB.put(params).promise();

  return params.Item;
}

export async function queryRequestsByStatusType({ hotelId, statusType, limit = 25, nextToken }) {
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
      ':pk': `ORDERSTATUS#${statusType.toUpperCase()}#HOTEL#${hotelId}`,
    },
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
