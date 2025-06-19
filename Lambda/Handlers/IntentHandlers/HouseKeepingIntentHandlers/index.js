
const { HouseKeepingIntentHandlerGenerator } = require("./HouseKeepingIntentHandler");
const Intent = require('../../../Models/Intent.js');


const HouseKeeping_DentalKit_Handler = HouseKeepingIntentHandlerGenerator({ intentName: Intent.INTENT_NAMES.DENTAL_KIT })
const HouseKeeping_Toiletries_Handler = HouseKeepingIntentHandlerGenerator({ intentName: Intent.INTENT_NAMES.TOILETRIES })
const HouseKeeping_RoomClean_Handler = HouseKeepingIntentHandlerGenerator({ intentName: Intent.INTENT_NAMES.ROOM_CLEAN })
const HouseKeeping_Bedding_Handler = HouseKeepingIntentHandlerGenerator({ intentName: Intent.INTENT_NAMES.BEDDING })
const HouseKeeping_Towels_Handler = HouseKeepingIntentHandlerGenerator({ intentName: Intent.INTENT_NAMES.TOWELS })
const HouseKeeping_Laundry_Handler = HouseKeepingIntentHandlerGenerator({ intentName: Intent.INTENT_NAMES.LAUNDRY })
const HouseKeeping_IronBox_Handler = HouseKeepingIntentHandlerGenerator({ intentName: Intent.INTENT_NAMES.IRON_BOX })
const HouseKeeping_IceCubes_Handler = HouseKeepingIntentHandlerGenerator({ intentName: Intent.INTENT_NAMES.ICE_CUBES })
const HouseKeeping_ShoeShineKit_Handler = HouseKeepingIntentHandlerGenerator({ intentName: Intent.INTENT_NAMES.SHOE_SHINE_KIT })



const HouseKeepingIntentHandlers = {
    HouseKeeping_DentalKit_Handler,
    HouseKeeping_Toiletries_Handler,
    HouseKeeping_RoomClean_Handler,
    HouseKeeping_Bedding_Handler,
    HouseKeeping_Towels_Handler,
    HouseKeeping_Laundry_Handler,
    HouseKeeping_IronBox_Handler,
    HouseKeeping_IceCubes_Handler,
    HouseKeeping_ShoeShineKit_Handler
}

module.exports = HouseKeepingIntentHandlers;