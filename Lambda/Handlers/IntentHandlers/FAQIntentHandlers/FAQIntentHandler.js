const Alexa = require('ask-sdk-core');
const axios = require('axios');
const { EC2_ENDPOINT } = require('../../../Constants/EC2.constants.js');
const Intent = require('../../../Models/Intent.js');

const FAQIntentHandlerGenerator = ({ intentName, cost = 0 }) => {

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
                console.log(JSON.stringify(handlerInput.requestEnvelope))

                const device_id = handlerInput.requestEnvelope.context.System.device.deviceId;
                // const room_number = handlerInput.requestEnvelope.request.intent.slots.RoomNumber.value;
                const token = process.env.EC2_AUTH_TOKEN;
                // TODO :: add try catch
                const response = await axios.post(`${EC2_ENDPOINT}/intents`, getIntent(device_id), {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const res = await axios.get(`${EC2_ENDPOINT}/faq/Room%20Genie`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                console.log("Intent added to DB", response);
                console.log(`FAQ List got from DB`, res.data.faqData)

                const faqs = res.data.faqData;
                const faq = faqs.find(faq => faq.intentName === intentName);

                const responseSpeechText = faq.answer || "Sorry, I don't have the answer to that question at the moment. I will ask our staff to get back to you.";

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

module.exports = { FAQIntentHandlerGenerator };
