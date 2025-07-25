const Alexa = require('ask-sdk-core');
const axios = require('axios');
const { EC2_ENDPOINT } = require('../../../Constants/EC2.constants.js');
const Intent = require('../../../Models/Intent.js');

const FallbackIntentHandlerGenerator = ({ intentName, cost = 0 }) => {

    const getIntent = (device_id) => {
        return new Intent(device_id, intentName, cost)
    }

    // const responseSpeechText = Intent.speechText[intentName];

    return (
        {
            canHandle(handlerInput) {
                return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
                    && Alexa.getIntentName(handlerInput.requestEnvelope) === intentName;
            },
            async handle(handlerInput) {

                const userUtterance = handlerInput.requestEnvelope.request.intent.slots?.query?.value
                    || handlerInput.requestEnvelope.request.reason
                    || 'Unknown request';
                console.log(JSON.stringify(handlerInput.requestEnvelope))
                console.log("______userUtterance______", userUtterance);

                const device_id = handlerInput.requestEnvelope.context.System.device.deviceId;
                // const room_number = handlerInput.requestEnvelope.request.intent.slots.RoomNumber.value;
                const token = process.env.EC2_AUTH_TOKEN;
                // TODO :: add try catch
                const response = await axios.post(`${EC2_ENDPOINT}/intents`, getIntent(device_id), {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });


                console.log("Intent added to DB", response);

                const responseSpeechText = "Sorry, I don't have the answer to that question at the moment. I will ask our staff to get back to you.";

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

module.exports = { FallbackIntentHandlerGenerator };
