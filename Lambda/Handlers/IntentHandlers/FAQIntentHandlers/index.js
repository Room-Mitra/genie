const { FAQIntentHandlerGenerator } = require("./FAQIntentHandler");
const Intent = require('../../../Models/Intent.js');


const FAQ_SwimmingPool_Handler = FAQIntentHandlerGenerator({ intentName: Intent.INTENT_NAMES.SWIMMING_POOL_DETAILS })
const FAQ_Breakfast_Handler = FAQIntentHandlerGenerator({ intentName: Intent.INTENT_NAMES.BREAKFAST_DETAILS })
const FAQ_CheckIn_CheckOut_Handler = FAQIntentHandlerGenerator({ intentName: Intent.INTENT_NAMES.CHECKIN_CHECKOUT_DETAILS })
const FAQ_Gym_Handler = FAQIntentHandlerGenerator({ intentName: Intent.INTENT_NAMES.GYM_DETAILS })



const FAQIntentHandlers = {
    FAQ_SwimmingPool_Handler,
    FAQ_Breakfast_Handler,
    FAQ_CheckIn_CheckOut_Handler,
    FAQ_Gym_Handler
}

module.exports = FAQIntentHandlers;

