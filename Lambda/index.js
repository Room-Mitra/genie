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
const { MandatoryIntentHandlers, DeviceIntentHandlers, HouseKeepingIntentHandlers, FAQIntentHandlers, FallbackIntentHandlers } = IntentHandlers;
const { HelpIntentHandler, CancelAndStopIntentHandler } = MandatoryIntentHandlers;
const { RegisterDeviceHandler } = DeviceIntentHandlers;
const {
    HouseKeeping_DentalKit_Handler,
    HouseKeeping_Toiletries_Handler,
    HouseKeeping_RoomClean_Handler,
    HouseKeeping_Bedding_Handler,
    HouseKeeping_Towels_Handler,
    HouseKeeping_Laundry_Handler,
    HouseKeeping_IronBox_Handler,
    HouseKeeping_IceCubes_Handler,
    HouseKeeping_ShoeShineKit_Handler
} = HouseKeepingIntentHandlers;

const {
    FAQ_SwimmingPool_Handler,
    FAQ_Breakfast_Handler,
    FAQ_CheckIn_CheckOut_Handler,
    FAQ_Gym_Handler
} = FAQIntentHandlers;


const { FallbackIntentHandler } = FallbackIntentHandlers;

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

        HouseKeeping_DentalKit_Handler,
        HouseKeeping_Toiletries_Handler,
        HouseKeeping_RoomClean_Handler,
        HouseKeeping_Bedding_Handler,
        HouseKeeping_Towels_Handler,
        HouseKeeping_Laundry_Handler,
        HouseKeeping_IronBox_Handler,
        HouseKeeping_IceCubes_Handler,
        HouseKeeping_ShoeShineKit_Handler,

        FAQ_SwimmingPool_Handler,
        FAQ_Breakfast_Handler,
        FAQ_CheckIn_CheckOut_Handler,
        FAQ_Gym_Handler,

        FallbackIntentHandler,

        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler)
    .addErrorHandlers(ErrorHandler)
    .lambda();