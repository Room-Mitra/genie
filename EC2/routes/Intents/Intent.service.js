const { getRoomInfoFromDeviceId } = require("../Device/Device.service");
const { addIntent: addIntentToCache, getIntentsForDate: getIntentsForDateFromCache } = require("./Intent.cache");
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

const getIntentsForDate = async (dateAsInteger, bypassCache = false) => {
    const intents = await (bypassCache ? getIntentsForDateFromRepo(dateAsInteger) : getIntentsForDateFromCache(dateAsInteger)); // TODO : add caching
    intents.forEach(intent => {
        try {
            const { propertyName, floor, roomTags, roomNotes } = getRoomInfoFromDeviceId(intent.deviceId); //TODO :: Handle Error
            intent.propertyName = propertyName;
            intent.floor = floor;
            intent.roomTags = roomTags;
            intent.roomNotes = roomNotes;
        }
        catch (e) {
            console.log(e)
        }
    });
    return intents;
}

const getIntentsForDateRange = async (lastDaySinceEpoch, range = 0, bypassCache = false) => { //TODO :: use batchGetItem, this is costly instead of looping individual db calls 
    if (range > 30) {
        throw new Error("Range must be less than 30");
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

}


module.exports = { registerIntent, getIntentsForDateRange };
