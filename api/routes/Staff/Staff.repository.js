import { GUEST_TABLE_NAME as STAFF_TABLE_NAME } from '../../Constants/DB.constants.js';
import DDB from '../../config/DynamoDb.config.js';

const ID_TYPE = 'STAFF:';

const addIdType = (staff) => {
  staff.id = `${ID_TYPE}${staff.id}`;
  return staff;
};

const removeIdType = (staff) => {
  staff.id = staff.id.slice(ID_TYPE.length);
  return staff;
};

export const addStaff = async (staff) => {
  // const { staffData } = await getStaff(staff.id);
  // if (staffData) {
  //     throw new Error(" staff already exists")
  // }
  const params = {
    TableName: STAFF_TABLE_NAME,
    Item: { ...addIdType(staff) },
  };
  await DDB.put(params).promise(); // TODO :: Handle Error
  console.log('********STAFF ADDED*******', params);
  return params.Item;
};

export const getStaff = async (staffId) => {
  const params = {
    TableName: STAFF_TABLE_NAME,
    ExpressionAttributeValues: {
      ':id': `${ID_TYPE}${staffId}`,
    },
    KeyConditionExpression: 'id=:id',
  };
  const staffData = await DDB.query(params).promise(); // TODO :: Handle Error
  console.log('Staff Data From DB :: ', staffData, params);
  if (staffData && staffData.Items && staffData.Items.length) {
    return { ...removeIdType(staffData.Items[0]) };
  }
  return { staffData: null };
};

// const updateStaff = async (staffId, staffData) => {
//     const staffDetails = await getStaff(staffId);
//     staffData = { ...staffDetails, ...staffData };
//     const params = {
//         TableName: STAFF_TABLE_NAME,
//         Item: { ...addIdType(staffData) },

//     };

//     await DDB.put(params).promise(); // TODO :: Handle Error
//     return params.Item;
// }

// const deleteStaff = async (staffId) => {
//     const params = {
//         TableName: STAFF_TABLE_NAME,
//         Key: {
//             id: `${ID_TYPE}${staffId}`
//         }
//     };
//     await DDB.delete(params).promise(); // TODO :: Handle Error
//     return params.Item;
// }
