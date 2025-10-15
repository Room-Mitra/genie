import { ENTITY_TABLE_NAME } from '#Constants/DB.constants.js';
import { buildEntityItem } from '#common/entity.helper.js';
import DDB from '#config/DynamoDb.config.js';

/**
 * Writes a Hotel entity.
 * Uses a conditional put so we do not overwrite an existing item accidentally.
 * Expects `hotel` to be a plain JS object with keys created in the service.
 */
export async function putHotel(hotel) {
  const hotelItem = buildEntityItem(hotel);

  const params = {
    TableName: ENTITY_TABLE_NAME,
    Item: hotelItem,
    ConditionExpression: 'attribute_not_exists(entityId) AND attribute_not_exists(entityTypeTs)',
  };

  try {
    console.log(await DDB.put(params).promise());
  } catch (err) {
    // Bubble up a clearer message on conditional failures
    if (err && err.code === 'ConditionalCheckFailedException') {
      throw new Error('Hotel already exists with the same keys');
    }
    throw err;
  }
}
