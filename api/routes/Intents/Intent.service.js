import { getRoomInfoFromDeviceId } from '../Device/Device.service.js';
import { getMappingByRoomAndDepartment } from '../StaffRoomDepartmentRequestMapping/StaffRoomDepartmentRequestMapping.service.js';
import {
  addIntent as addIntentToCache,
  getIntentsForDate as getIntentsForDateFromCache,
} from './Intent.cache.js';

import {
  addIntent as addIntentToDB,
  getIntentsForDate as getIntentsForDateFromRepo,
} from './Intent.repository.js';

import { sendWhatsAppTemplate } from '../../common/services/whatsapp.js';

export const registerIntent = async (intent) => {
  if (!intent.roomId) {
    // updateIntentWithRoomInfo(intent); // TODO :: Handle Error
  }
  console.log('Intent : ', intent);
  addIntentToCache(intent);
  addIntentToDB(intent);
  if (!intent.assignedTo) {
    const mapping = await getMappingByRoomAndDepartment(
      intent.hotelId,
      intent.roomId,
      intent.intentType
    );
    console.log('Mapping :: ', mapping);
    const names = mapping.map((o) => o.staffName).toLocaleString() || '';
    intent.assignedTo = names;
    const phoneNumbers = mapping.map((m) => m.staffPhone) || [];
    phoneNumbers.forEach((pn) => sendWhatsAppTemplate('91' + pn, intent.roomId));
  }
};

export const updateIntentWithRoomInfo = (intent) => {
  const deviceId = intent.deviceId;
  const { roomId, hotelId } = getRoomInfoFromDeviceId(deviceId); //TODO :: Handle Error
  intent.roomId = roomId;
  intent.hotelId = hotelId;
};

export const getIntentsForDate = async (dateAsInteger, bypassCache = false) => {
  const intents = await (bypassCache
    ? getIntentsForDateFromRepo(dateAsInteger)
    : getIntentsForDateFromCache(dateAsInteger)); // TODO : add caching
  intents.forEach((intent) => {
    try {
      const { propertyName, floor, roomTags, roomNotes } = getRoomInfoFromDeviceId(intent.deviceId); //TODO :: Handle Error
      intent.propertyName = propertyName;
      intent.floor = floor;
      intent.roomTags = roomTags;
      intent.roomNotes = roomNotes;
    } catch (e) {
      console.log(e);
    }
  });
  return intents;
};

export const getIntentsForDateRange = async (lastDaySinceEpoch, range = 0, bypassCache = false) => {
  //TODO :: use batchGetItem, this is costly instead of looping individual db calls
  if (range > 30) {
    throw new Error('Range must be less than 30');
  }
  const promisesArray = [];
  for (let i = lastDaySinceEpoch; i >= lastDaySinceEpoch - range; i--) {
    promisesArray.push(getIntentsForDate(i, bypassCache));
  }
  const intentsArray = await Promise.all(promisesArray);
  const INTENTS = {};
  for (let i = lastDaySinceEpoch; i >= lastDaySinceEpoch - range; i--) {
    INTENTS[i] = intentsArray[lastDaySinceEpoch - i];
  }
  return INTENTS;
};
