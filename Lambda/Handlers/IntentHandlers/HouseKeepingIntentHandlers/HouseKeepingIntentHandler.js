const Alexa = require('ask-sdk-core');
const axios = require('axios');
const { EC2_ENDPOINT } = require('../../../Constants/EC2.constants.js');
const Intent = require('../../../Models/Intent.js');

const HouseKeepingIntentHandlerGenerator = ({ intentName, cost = 0 }) => {

    const getIntent = (device_id) => {
        return new Intent(device_id, intentName, cost)
    }

    const responseSpeechText = Intent.speechText[intentName];

    return (
        {
            canHandle(handlerInput) {
                return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
                    && Alexa.getIntentName(handlerInput.requestEnvelope) === intentName;
            },
            async handle(handlerInput) {
                console.log(JSON.stringify(handlerInput.requestEnvelope))

                const device_id = handlerInput.requestEnvelope.context.System.device.deviceId;
                // const room_number = handlerInput.requestEnvelope.request.intent.slots.RoomNumber.value;

                // TODO :: add try catch
                const response = await axios.post(`${EC2_ENDPOINT}/intents`, getIntent(device_id));
                console.log(response)
                const speechText = handlerInput.t(responseSpeechText);

                return handlerInput.responseBuilder
                    .speak(speechText)
                    // .reprompt(speechText)
                    .withShouldEndSession(true)
                    .withSimpleCard(handlerInput.t(responseSpeechText), handlerInput.t(responseSpeechText))
                    .getResponse();
            },

        }
    )
}

module.exports = { HouseKeepingIntentHandlerGenerator };
