import { GUEST_TABLE_NAME as MAPPING_TABLE_NAME } from '#Constants/DB.constants.js';
import DDB from '#config/DynamoDb.config.js';

const ID_TYPE = 'MAPPING_STAFF_DEPARTMENT_ROOM:';

const addIdType = (staff) => {
  staff.id = `${ID_TYPE}${staff.id}`;
  return staff;
};

const removeIdType = (staff) => {
  staff.id = staff.id.slice(ID_TYPE.length);
  return staff;
};

export const getMappingFromDB = async (hotelId) => {
  const params = {
    TableName: MAPPING_TABLE_NAME,
    ExpressionAttributeValues: {
      ':id': `${ID_TYPE}${hotelId}`,
    },
    KeyConditionExpression: 'id=:id',
  };
  const mappingData = await DDB.query(params).promise(); // TODO :: Handle Error
  console.log('Mapping Data From DB :: ', mappingData, params);
  if (mappingData && mappingData.Items && mappingData.Items.length) {
    return { ...removeIdType(mappingData.Items[0]) };
  }
  return { mappingData: null };
};

export const addMappingToDB = async (staff) => {
  const params = {
    TableName: MAPPING_TABLE_NAME,
    Item: { ...addIdType(staff) },
  };
  await DDB.put(params).promise(); // TODO :: Handle Error
  console.log('********MAPPING ADDED*******', params);
  return params.Item;
};
