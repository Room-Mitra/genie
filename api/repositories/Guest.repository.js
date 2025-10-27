import { GUEST_TABLE_NAME } from '#Constants/DB.constants.js';
import DDB from '#clients/DynamoDb.client.js';

const ID_TYPE = 'GUEST:';

const addIdType = (guest) => {
  guest.id = `${ID_TYPE}${guest.id}`;
  return guest;
};

const removeIdType = (guest) => {
  guest.id = guest.id.slice(ID_TYPE.length);
  return guest;
};

export const getGuest = async (guestId) => {
  const params = {
    TableName: GUEST_TABLE_NAME,
    ExpressionAttributeValues: {
      ':id': `${ID_TYPE}${guestId}`,
    },
    KeyConditionExpression: 'id=:id',
  };
  const guestData = await DDB.query(params).promise(); // TODO :: Handle Error
  if (guestData && guestData.Items && guestData.Items.length) {
    return { ...removeIdType(guestData.Items[0]) };
  }
  return { guestData: null };
};

export const updateGuest = async (guestId, guestData) => {
  const params = {
    TableName: GUEST_TABLE_NAME,
    Item: { ...addIdType(guestData) },
  };

  await DDB.put(params).promise(); // TODO :: Handle Error
  return params.Item;
};
