import { ENTITY_TABLE_NAME } from '#Constants/DB.constants.js';
import DDB from '#config/DynamoDb.config.js';



/**
 * Writes a Hotel entity.
 * Uses a conditional put so we do not overwrite an existing item accidentally.
 * Expects `hotel` to be a plain JS object with keys created in the service.
 */
export async function putHotel(hotel) {
  const params = {
    TableName: ENTITY_TABLE_NAME,
    Item: {
      entityId: hotel.entityId, // PK   e.g. HOTEL#<ulid>
      entityTypeTs: hotel.entityTypeTs, // SK   e.g. HOTEL#<ts>
      hotelId: hotel.hotelId, // GSI PK field
      entityType: hotel.entityType, // "HOTEL"
      name: hotel.name,
      address: hotel.address,
      city: hotel.city,
      country: hotel.country,
      contactEmail: hotel.contactEmail,
      contactPhone: hotel.contactPhone,
      createdAt: hotel.createdAt,
    },
    ConditionExpression: 'attribute_not_exists(entityId) AND attribute_not_exists(entityTypeTs)',
  };

  try {
    await DDB.put(params).promise();
  } catch (err) {
    // Bubble up a clearer message on conditional failures
    if (err && err.code === 'ConditionalCheckFailedException') {
      throw new Error('Hotel already exists with the same keys');
    }
    throw err;
  }
}
