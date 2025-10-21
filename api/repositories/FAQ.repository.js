import { GUEST_TABLE_NAME as FAQ_TABLE_NAME } from '#Constants/DB.constants.js';
import DDB from '#config/DynamoDb.config.js';

const ID_TYPE = 'FAQ:';

const addIdType = (faq) => {
  faq.id = `${ID_TYPE}${faq.hotelId}`;
  return faq;
};

const removeIdType = (guest) => {
  guest.id = guest.id.slice(ID_TYPE.length);
  return guest;
};

export const addFAQ = async (faq) => {
  const params = {
    TableName: FAQ_TABLE_NAME,
    Item: { ...addIdType(faq) },
  };
  await DDB.put(params).promise(); // TODO :: Handle Error
  return params.Item;
};

export const getFAQ = async (hotelId) => {
  const params = {
    TableName: FAQ_TABLE_NAME,
    ExpressionAttributeValues: {
      ':id': `${ID_TYPE}${hotelId}`,
    },
    KeyConditionExpression: 'id=:id',
  };
  const faqData = await DDB.query(params).promise(); // TODO :: Handle Error
  if (faqData && faqData.Items && faqData.Items.length) {
    return { ...removeIdType(faqData.Items[0]) };
  }
  return { faqData: null };
};
