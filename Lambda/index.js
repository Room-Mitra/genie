// https://developer.amazon.com/en-US/docs/alexa/alexa-skills-kit-sdk-for-nodejs/develop-your-first-skill.html
// https://dev.to/rajandmr/dynamodb-crud-with-nodejs-and-lambda-inn


// Add ec2 and lambda to same vpc
"use strict";

const AWS = require('aws-sdk');
const Alexa = require('ask-sdk-core');

const { SKILL_ID } = require("./Constants/Skill.constants.js");

const Handlers = require("./Handlers/index.js");
const { RequestHandlers, ErrorHandlers, IntentHandlers } = Handlers;
const { LaunchRequestHandler, SessionEndedRequestHandler } = RequestHandlers;
const { ErrorHandler } = ErrorHandlers;
const { MandatoryIntentHandlers, DeviceIntentHandlers } = IntentHandlers;
const { HelpIntentHandler, CancelAndStopIntentHandler } = MandatoryIntentHandlers;
const { RegisterDeviceHandler } = DeviceIntentHandlers;

const { Interceptors } = require("./Interceptors/index.js");
const { RequestInterceptor } = Interceptors;
const { LocalizationRequestInterceptor } = RequestInterceptor;


exports.handler = Alexa.SkillBuilders.custom()
    .withSkillId(SKILL_ID)
    .addRequestInterceptors(
        LocalizationRequestInterceptor
    )
    .addRequestHandlers(
        LaunchRequestHandler,
        RegisterDeviceHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler)
    .addErrorHandlers(ErrorHandler)
    .lambda();