import { GUEST_TABLE_NAME as USER_LOGIN_TABLE_NAME } from '../../Constants/DB.constants.js';
import DDB from '../../config/DynamoDb.config.js';

export const getUser = async (userId) => {
  const params = {
    TableName: USER_LOGIN_TABLE_NAME,
    ExpressionAttributeValues: {
      ':id': `${userId}`,
    },
    KeyConditionExpression: 'id=:id',
  };
  try {
    console.info('Accessing Login details from DB with params', params);
    const userData = await DDB.query(params).promise();
    console.info('User Data From DB :: ', userData, ' :: for input params ::', params);
    if (userData && userData.Items && userData.Items.length) {
      return { ...userData.Items[0] };
    }
  } catch (e) {
    console.error(
      'Error while accessing login details from DB',
      e,
      ' :: for input params ::',
      params
    );
  }
  return null;
};

export const addUser = async (userData) => {
  console.info('Attempting to add user to Login DB :: ', userData);
  const params = {
    TableName: USER_LOGIN_TABLE_NAME,
    Item: { ...userData },
  };
  try {
    await DDB.put(params).promise();
    console.info('USER ADDED :: ', params);
    return params.Item;
  } catch (e) {
    console.error('Failed to add user. Error :: ', e, ' :: for input params ::', params);
  }
  return null;
};
