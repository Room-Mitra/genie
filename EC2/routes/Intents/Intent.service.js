const { getRoomIdFromDeviceId } = require("../Device/Device.service");
const { addIntent: addIntentToCache, isIntentExists } = require("./Intent.cache");
const { addIntent: addIntentToDB } = require("./Intent.repository")

const registerIntent = async (intent) => {
    // ensureIntentIdUnique(intent); // Over optimization Not Reqd
    if (!intent.roomId) {
        updateIntentWithRoomNumber(intent); // TODO :: Handle Error 
    }
    addIntentToCache(intent)
    addIntentToDB(intent)
}

const updateIntentWithRoomNumber = (intent) => {
    const deviceId = intent.deviceId;
    const roomId = getRoomIdFromDeviceId(deviceId) //TODO :: Handle Error
    intent.roomId = roomId;
}

/*const ensureIntentIdUnique = (intent) => {
    while (isIntentExists(intent)) { // TODO:: add logs as you are updating PK coming from lambda.. will be hard to track if error
        intent.requestedTime++;
    }
}*/

module.exports = { registerIntent };
