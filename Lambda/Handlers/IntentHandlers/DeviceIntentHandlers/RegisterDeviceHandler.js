const Alexa = require('ask-sdk-core');
const axios = require('axios');
const Device = require('../../../Models/Device.js');

const RegisterDeviceHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RegisterDeviceIntent';
    },
    async handle(handlerInput) {
        console.log(JSON.stringify(handlerInput.requestEnvelope))
        const device_id = handlerInput.requestEnvelope.context.System.device.deviceId;
        const room_number = handlerInput.requestEnvelope.request.intent.slots.RoomNumber.value;

        const deviceDetails = new Device(device_id, room_number);
        // add try catch
        const response = await axios.post('http://34.240.95.34:3000/devices', deviceDetails);
        console.log(response)
        const speechText = handlerInput.t('RedgisterDeviceHandler_DeviceRegistered');

        return handlerInput.responseBuilder
            .speak(speechText)
            // .reprompt(speechText)
            .withShouldEndSession(true)
            .withSimpleCard(handlerInput.t('RedgisterDeviceHandler_DeviceRegistered'), handlerInput.t('RedgisterDeviceHandler_DeviceRegistered'))
            .getResponse();
    }
};

module.exports = { RegisterDeviceHandler };