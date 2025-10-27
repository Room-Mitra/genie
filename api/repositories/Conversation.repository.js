import DDB from '#clients/DynamoDb.client.js';
import { buildHotelEntityItem } from '#common/hotelEntity.helper.js';
import { ENTITY_TABLE_NAME } from '#Constants/DB.constants.js';

export async function saveConversationEntities(conversation, messages) {
  const TransactItems = [];

  if (conversation) {
    const conversationItem = buildHotelEntityItem(conversation);
    TransactItems.push({
      Put: {
        TableName: ENTITY_TABLE_NAME,
        Item: conversationItem,
        ConditionExpression: 'attribute_not_exists(pk)',
      },
    });
  }

  messages.map(buildHotelEntityItem).forEach((mi) => {
    TransactItems.push({
      Put: {
        TableName: ENTITY_TABLE_NAME,
        Item: mi,
        ConditionExpression: 'attribute_not_exists(pk)',
      },
    });
  });

  return DDB.transactWrite({ TransactItems }).promise();
}
