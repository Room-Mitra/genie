import { GUEST_TABLE_NAME as ANDROID_LOGIN_TABLE_NAME } from '../../Constants/DB.constants.js';
import DDB from '../../config/DynamoDb.config.js';

export const getHotel = async (hotelId) => {
  const params = {
    TableName: ANDROID_LOGIN_TABLE_NAME,
    ExpressionAttributeValues: {
      ':id': `${hotelId}`,
    },
    KeyConditionExpression: 'id=:id',
  };
  try {
    console.info(`${hotelId} ->` + 'Accessing Login details from DB with params', params);
    const hotelData = await DDB.query(params).promise();
    console.info(
      `${hotelId} ->` + 'Hotel Data From DB :: ',
      hotelData,
      ' :: for input params ::',
      params
    );
    if (hotelData && hotelData.Items && hotelData.Items.length) {
      return { ...hotelData.Items[0] };
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

export const addHotel = async (hotelData) => {
  console.info('Attempting to add Hotel to Login DB :: ', hotelData);
  const params = {
    TableName: ANDROID_LOGIN_TABLE_NAME,
    Item: { ...hotelData },
  };
  try {
    await DDB.put(params).promise();
    console.info('Hotel Added :: ', params);
    return params.Item;
  } catch (e) {
    console.error('Failed to add Hotel. Error :: ', e, ' :: for input params ::', params);
  }
  return null;
};
