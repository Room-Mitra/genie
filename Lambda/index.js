// https://developer.amazon.com/en-US/docs/alexa/alexa-skills-kit-sdk-for-nodejs/develop-your-first-skill.html
// https://dev.to/rajandmr/dynamodb-crud-with-nodejs-and-lambda-inn

"use strict";

const AWS = require('aws-sdk');
const Alexa = require('ask-sdk-core');

const { SKILL_ID } = require("./Constants/Skill.constants.js");

const Handlers = require("./Handlers/index.js");
const { RequestHandlers, ErrorHandlers, IntentHandlers } = Handlers;
const { LaunchRequestHandler, SessionEndedRequestHandler } = RequestHandlers;
const { ErrorHandler } = ErrorHandlers;
const { MandatoryIntentHandlers } = IntentHandlers;
const { HelpIntentHandler, CancelAndStopIntentHandler } = MandatoryIntentHandlers;

const { Interceptors } = require("./Interceptors/index.js");
const { RequestInterceptor } = Interceptors;
const { LocalizationRequestInterceptor } = RequestInterceptor;


const AskWeatherIntentHandler = {   // need to update speechText
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AskWeatherIntent';
    },

    async handle(handlerInput) {
        const docClient = new AWS.DynamoDB.DocumentClient();

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

exports.handler = Alexa.SkillBuilders.custom()
    .withSkillId(SKILL_ID)
    .addRequestInterceptors(
        LocalizationRequestInterceptor
    )
    .addRequestHandlers(
        LaunchRequestHandler,
        AskWeatherIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler)
    .addErrorHandlers(ErrorHandler)
    .lambda();