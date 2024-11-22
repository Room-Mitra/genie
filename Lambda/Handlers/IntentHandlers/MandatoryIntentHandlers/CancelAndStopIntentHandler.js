const Alexa = require('ask-sdk-core');


const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speechText = handlerInput.t('CancelAndStopIntentHandler_short');

        return handlerInput.responseBuilder
            .speak(speechText)
            .withSimpleCard(handlerInput.t('CancelAndStopIntentHandler_short'),
                handlerInput.t('CancelAndStopIntentHandler_Desc'))
            .withShouldEndSession(true)
            .getResponse();
    }
};

module.exports = { CancelAndStopIntentHandler };


