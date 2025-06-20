import { INTENTS_TABLE_NAME } from '../../Constants/DB.constants.js';
import DDB from '../../config/DynamoDb.config.js';

export const addIntent = async (intent) => {
  const params = {
    TableName: INTENTS_TABLE_NAME,
    Item: { ...intent },
  };

  await DDB.put(params).promise(); // TODO :: Handle Error
  return params.Item;
};

export const getIntentsForDate = async (dateAsInteger) => {
  const params = {
    TableName: INTENTS_TABLE_NAME,
    ExpressionAttributeValues: {
      ':daysSinceEpoch': dateAsInteger,
    },
    KeyConditionExpression: 'daysSinceEpoch=:daysSinceEpoch',
  };

  const intents = await DDB.query(params).promise(); // TODO :: Handle Error
  console.log(intents);
  return intents.Items || [];
};
