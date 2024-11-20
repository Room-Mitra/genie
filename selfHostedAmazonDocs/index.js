// https://developer.amazon.com/en-US/docs/alexa/alexa-skills-kit-sdk-for-nodejs/develop-your-first-skill.html

"use strict";
const AWS = require('aws-sdk');
const Alexa = require('ask-sdk-core');

const docClient = new AWS.DynamoDB.DocumentClient();

const LaunchRequestHandler = {  // need to update speechText
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speechText = 'Welcome to your SDK weather skill. Ask me the weather!';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .withSimpleCard('Welcome to your SDK weather skill. Ask me the weather!', speechText)
            .getResponse();
    }
};

const AskWeatherIntentHandler = {   // need to update speechText
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AskWeatherIntent';
    },

    async handle(handlerInput) {

        console.log(JSON.stringify(handlerInput))
        console.log(JSON.stringify(handlerInput.request_envelope))


        let table = "anantherraSelfHosted2";
        let year = 2015;
        let title = "The Big New Movie" + Math.random() * 10;
        let params = {
            TableName: table,
            Item: {
                "year": year,
                "id": title,
                "info": {
                    "plot": "Nothing happens at all",
                    "rating": 0
                }
            }
        }
        let insertMsg = '';
        try {
            let result = await docClient.put(params).promise();
            if (result) {
                console.log(">>>>>>>>>", result);
                insertMsg = JSON.stringify(result);;
            }
        } catch (error) {
            console.log(error);
            return error;
        }



        let getMsg = '';
        params = {
            TableName: table,
            Key: {
                //   "year": year,
                "id": title
            }
        }

        try {
            let result = await docClient.get(params).promise();
            if (result) {
                console.log(">>>>>>>>>", result);
                getMsg = JSON.stringify(result);
            }
        } catch (error) {
            console.log(error);
            return error;
        }

        const speechText = insertMsg + 'The weather today is sunny.' + getMsg;



        try {
            params = {
                TableName: table,
                Item: {
                    "year": 1900,
                    "id": title,
                    "info": {
                        "plot": "shaata happens",
                        "rating": 0
                    }
                }
            }
            docClient.put(params).promise();

        } catch (error) {
            console.log(error);
            return error;
        }


        return handlerInput.responseBuilder
            .speak(speechText)
            .withSimpleCard('The weather today is sunny.', speechText)
            .getResponse();
    }
};

const HelpIntentHandler = { // need to update speechText
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speechText = 'You can ask me the weather!';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .withSimpleCard('You can ask me the weather!', speechText)
            .getResponse();
    }
};


const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speechText = 'Goodbye!';

        return handlerInput.responseBuilder
            .speak(speechText)
            .withSimpleCard('Goodbye!', speechText)
            .withShouldEndSession(true)
            .getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any clean-up logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`Error handled: ${error.message}`);

        return handlerInput.responseBuilder
            .speak('Sorry, I don\'t understand your command. Please say it again.')
            .reprompt('Sorry, I don\'t understand your command. Please say it again.')
            .getResponse();
    }
};

exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        AskWeatherIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler)
    .addErrorHandlers(ErrorHandler)
    .lambda();