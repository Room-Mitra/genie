const Alexa = require('ask-sdk-core');


const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speechText = handlerInput.t('HelpIntentHandler_HelpText');

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .withSimpleCard(handlerInput.t('HelpIntentHandler_HelpText'), handlerInput.t('HelpIntentHandler_HelpTextDesc'))
            .getResponse();
    }
};

module.exports = { HelpIntentHandler };

