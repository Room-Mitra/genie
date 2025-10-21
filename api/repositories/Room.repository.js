import { buildHotelEntityItem } from '#common/hotelEntity.helper.js';
import DDB from '#config/DynamoDb.config.js';
import { ENTITY_TABLE_NAME } from '#Constants/DB.constants.js';

export const createRoom = async (roomData) => {
  const roomItem = buildHotelEntityItem(roomData, { includeHotelTypeIndex: true });
  const params = {
    TableName: ENTITY_TABLE_NAME,
    Item: roomItem,
  };

  await DDB.put(params).promise();

  return params.Item;
};
