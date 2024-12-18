const MandatoryIntentHandlers = require("./MandatoryIntentHandlers/index.js");
const DeviceIntentHandlers = require("./DeviceIntentHandlers/index.js");

const IntentHandlers = {
    MandatoryIntentHandlers,
    DeviceIntentHandlers
}

module.exports = IntentHandlers;