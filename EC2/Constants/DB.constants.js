const DEVICES_TABLE_NAME = "DEVICES"; // entire db is loaded to server cache
const INTENTS_TABLE_NAME = "INTENTS"; // pk = daysSinceEpoch, sk=requestedTime
const GUEST_TABLE_NAME = "GUEST"; // pk = guestId/bookingId

module.exports = {
    DEVICES_TABLE_NAME,
    INTENTS_TABLE_NAME,
    GUEST_TABLE_NAME
}