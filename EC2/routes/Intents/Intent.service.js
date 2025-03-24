const { getRoomInfoFromDeviceId } = require("../Device/Device.service");
const { addIntent: addIntentToCache } = require("./Intent.cache");
const { addIntent: addIntentToDB, getIntentsForDate: getIntentsForDateFromRepo } = require("./Intent.repository")

const registerIntent = async (intent) => {
    if (!intent.roomId) {
        updateIntentWithRoomId(intent); // TODO :: Handle Error 
    }
    addIntentToCache(intent)
    addIntentToDB(intent)
}

const updateIntentWithRoomId = (intent) => {
    const deviceId = intent.deviceId;
    const { roomId } = getRoomInfoFromDeviceId(deviceId); //TODO :: Handle Error
    intent.roomId = roomId;
}

const getIntentsForDate = async (dateAsInteger) => {
    const intents = await getIntentsForDateFromRepo(dateAsInteger); // TODO : add caching
    intents.forEach(intent => {
        const { propertyName, floor, roomTags, roomNotes } = getRoomInfoFromDeviceId(intent.deviceId); //TODO :: Handle Error
        intent.propertyName = propertyName;
        intent.floor = floor;
        intent.roomTags = roomTags;
        intent.roomNotes = roomNotes;
    });
    return intents;
}

const getIntentsForDateRange = async (lastDaySinceEpoch, range = 0) => {
    if (range > 30) {
        throw new Error("Range must be less than 30");
    }
    const promisesArray = [];
    for (let i = lastDaySinceEpoch; i >= lastDaySinceEpoch - range; i--) {
        promisesArray.push(getIntentsForDate(i));
    }
    const intentsArray = await Promise.all(promisesArray);
    const INTENTS = {};
    for (let i = lastDaySinceEpoch; i >= lastDaySinceEpoch - range; i--) {
        INTENTS[i] = intentsArray[lastDaySinceEpoch - i];
    }
    return INTENTS;

}


module.exports = { registerIntent, getIntentsForDateRange };
