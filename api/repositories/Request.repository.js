import DDB from '#config/DynamoDb.config.js';
import { ENTITY_TABLE_NAME, GSI_BOOKINGTYPE_NAME } from '#Constants/DB.constants.js';

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
