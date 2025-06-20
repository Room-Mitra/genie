import { GUEST_TABLE_NAME } from '../../Constants/DB.constants.js';
import DDB from '../../config/DynamoDb.config.js';

const ID_TYPE = 'BOOKING:';

const addIdType = (booking) => {
  booking.id = `${ID_TYPE}${booking.id}`;
  return booking;
};

const removeIdType = (booking) => {
  booking.id = booking.id.slice(ID_TYPE.length);
  return booking;
};

export const addBooking = async (bookingData) => {
  const params = {
    TableName: GUEST_TABLE_NAME,
    Item: { ...addIdType(bookingData) },
  };
  await DDB.put(params).promise(); // TODO :: Handle Error
  // console.log("********GUEST ADDED*******", params)
  return params.Item;
};
