import DDB from '#clients/DynamoDb.client.js';
import { buildHotelEntityItem } from '#common/hotelEntity.helper.js';
import { ENTITY_TABLE_NAME } from '#Constants/DB.constants.js';

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
