import DDB from '#clients/DynamoDb.client.js';
import { ENTITY_TABLE_NAME } from '#Constants/DB.constants';

export async function getHotelMenu({ hotelId }) {
  const pk = `HOTEL#${hotelId}`;
  const sk = `HOTEL#META#MENU#`;
  const params = {
    TableName: ENTITY_TABLE_NAME,
    KeyConditionExpression: 'pk = :pk and begins_with(sk, :sk)',
    ExpressionAttributeValues: { ':pk': pk, ':sk': sk },
    ScanIndexForward: false,
    Limit: 1,
  };

  const data = await DDB.query(params).promise();
  return data.Items && data.Items[0];
}
