const Alexa = require('ask-sdk-core');
const axios = require('axios');
const { EC2_ENDPOINT } = require('../../../Constants/EC2.constants.js');
const Intent = require('../../../Models/Intent.js');

const getTowelsIntent = (device_id) => {
    return new Intent(device_id, Intent.INTENT_NAMES.TOWELS, true)
}

const HouseKeeping_Towels_Handler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'HouseKeepingTowelsIntent';
    },
    async handle(handlerInput) {
        console.log(JSON.stringify(handlerInput.requestEnvelope))

        const device_id = handlerInput.requestEnvelope.context.System.device.deviceId;
        // const room_number = handlerInput.requestEnvelope.request.intent.slots.RoomNumber.value;

        // TODO :: add try catch
        const response = await axios.post(`${EC2_ENDPOINT}/intents`, getTowelsIntent(device_id));
        console.log(response)
        const speechText = handlerInput.t('HouseKeepingTowelsHandlerConfirmRequest');

        return handlerInput.responseBuilder
            .speak(speechText)
            // .reprompt(speechText)
            .withShouldEndSession(true)
            .withSimpleCard(handlerInput.t('HouseKeepingTowelsHandlerConfirmRequest'), handlerInput.t('HouseKeepingTowelsHandlerConfirmRequest'))
            .getResponse();
    },

};



module.exports = { HouseKeeping_Towels_Handler };