const { HelpIntentHandler } = require("./HelpIntentHandler.js");
const { CancelAndStopIntentHandler } = require("./CancelAndStopIntentHandler.js");

const MandatoryIntentHandlers = {
    HelpIntentHandler,
    CancelAndStopIntentHandler
}

module.exports = MandatoryIntentHandlers;