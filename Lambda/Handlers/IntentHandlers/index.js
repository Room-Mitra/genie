const MandatoryIntentHandlers = require("./MandatoryIntentHandlers/index.js");
const DeviceIntentHandlers = require("./DeviceIntentHandlers/index.js");
const HospatalityIntentHandlers = require("./HospatalityIntentHandlers/index.js");

const IntentHandlers = {
    MandatoryIntentHandlers,
    DeviceIntentHandlers,
    HospatalityIntentHandlers
}

module.exports = IntentHandlers;