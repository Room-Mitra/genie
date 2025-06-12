const MandatoryIntentHandlers = require("./MandatoryIntentHandlers/index.js");
const DeviceIntentHandlers = require("./DeviceIntentHandlers/index.js");
const HouseKeepingIntentHandlers = require("./HouseKeepingIntentHandlers/index.js");
const FAQIntentHandlers = require("./FAQIntentHandlers/index.js");

const IntentHandlers = {
    MandatoryIntentHandlers,
    DeviceIntentHandlers,
    HouseKeepingIntentHandlers,
    FAQIntentHandlers
}

module.exports = IntentHandlers;