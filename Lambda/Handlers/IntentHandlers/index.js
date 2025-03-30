const MandatoryIntentHandlers = require("./MandatoryIntentHandlers/index.js");
const DeviceIntentHandlers = require("./DeviceIntentHandlers/index.js");
const HouseKeepingIntentHandlers = require("./HouseKeepingIntentHandlers/index.js");

const IntentHandlers = {
    MandatoryIntentHandlers,
    DeviceIntentHandlers,
    HouseKeepingIntentHandlers
}

module.exports = IntentHandlers;