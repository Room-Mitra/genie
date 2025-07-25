const { FallbackIntentHandlerGenerator } = require("./FallbackIntentHandler");
const Intent = require('../../../Models/Intent.js');


const FallbackIntentHandler = FallbackIntentHandlerGenerator({ intentName: Intent.INTENT_NAMES.FALLBACK_INTENT })


const FallbackIntentHandlers = {
    FallbackIntentHandler,
}

module.exports = FallbackIntentHandlers;

