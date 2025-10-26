import { ENTITY_TABLE_NAME } from '#Constants/DB.constants.js';
import DDB from '#config/DynamoDb.config.js';

export async function getMessages({ conversationId }) {
  const params = {
    TableName: ENTITY_TABLE_NAME,
    KeyConditionExpression: '#pk = :p',
    ExpressionAttributeNames: { '#pk': 'pk' },
    ExpressionAttributeValues: { ':p': `CONVERSATION#${conversationId}` },
    ScanIndexForward: true,
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
    console.error('Failed to retrieve messages:', err);
    throw new Error('Failed to retrieve messages');
  }
}
