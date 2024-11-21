// import HOTEL_NAME from "../../Constants/Hotel.constants.js";
const Alexa = require('ask-sdk-core');

const { HOTEL_NAME } = require("../../Constants/Hotel.constants.js");


const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        // const speechText = `Welcome to ${HOTEL_NAME}. How can I help you?`;
        const speechText = handlerInput.t('MandatoryIntent_LaunchRequestHandler_WelcomeMsg')

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .withSimpleCard(speechText, speechText)
            .getResponse();
    }
};

module.exports = { LaunchRequestHandler };