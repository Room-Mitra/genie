const { getRoomIdFromDeviceId } = require("../Device/Device.service");
const { addIntent: addIntentToCache, isIntentExists } = require("./Intent.cache");
const { addIntent: addIntentToDB, getIntentsForDate: getIntentsForDateFromRepo } = require("./Intent.repository")

const registerIntent = async (intent) => {
    if (!intent.roomId) {
        updateIntentWithRoomNumber(intent); // TODO :: Handle Error 
    }
    addIntentToCache(intent)
    addIntentToDB(intent)
}

const updateIntentWithRoomNumber = (intent) => { // TODO :: Get entire room info
    const deviceId = intent.deviceId;
    const roomId = getRoomIdFromDeviceId(deviceId) //TODO :: Handle Error
    intent.roomId = roomId;
}

const getIntentsForDate = async (dateAsInteger) => {
    const intents = await getIntentsForDateFromRepo(dateAsInteger); // TODO : add caching
    return intents;
}


module.exports = { registerIntent, getIntentsForDate };
