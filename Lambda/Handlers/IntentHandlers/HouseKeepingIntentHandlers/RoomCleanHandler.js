const Alexa = require('ask-sdk-core');
const axios = require('axios');
const { EC2_ENDPOINT } = require('../../../Constants/EC2.constants.js');
const Intent = require('../../../Models/Intent.js');

const getRoomCleanIntent = (device_id) => {
    return new Intent(device_id, Intent.INTENT_NAMES.ROOM_CLEAN, true)
}

const HouseKeeping_RoomClean_Handler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'HouseKeepingRoomCleanIntent';
    },
    async handle(handlerInput) {
        console.log(JSON.stringify(handlerInput.requestEnvelope))

        const device_id = handlerInput.requestEnvelope.context.System.device.deviceId;
        // const room_number = handlerInput.requestEnvelope.request.intent.slots.RoomNumber.value;

        // TODO :: add try catch
        const response = await axios.post(`${EC2_ENDPOINT}/intents`, getRoomCleanIntent(device_id));
        console.log(response)
        const speechText = handlerInput.t('HouseKeepingRoomCleanHandlerConfirmRequest');

        return handlerInput.responseBuilder
            .speak(speechText)
            // .reprompt(speechText)
            .withShouldEndSession(true)
            .withSimpleCard(handlerInput.t('HouseKeepingRoomCleanHandlerConfirmRequest'), handlerInput.t('HouseKeepingRoomCleanHandlerConfirmRequest'))
            .getResponse();
    },

};



module.exports = { HouseKeeping_RoomClean_Handler };