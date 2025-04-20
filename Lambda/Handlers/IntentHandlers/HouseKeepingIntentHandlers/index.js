const { HouseKeeping_DentalKit_Handler } = require("./DentalKitHandler");
const { HouseKeeping_Toiletries_Handler } = require("./ToiletriesHandler");
const { HouseKeeping_RoomClean_Handler } = require("./RoomCleanHandler");
const { HouseKeeping_Bedding_Handler } = require("./BeddingHandler");

const HouseKeepingIntentHandlers = {
    HouseKeeping_DentalKit_Handler,
    HouseKeeping_Toiletries_Handler,
    HouseKeeping_RoomClean_Handler,
    HouseKeeping_Bedding_Handler
}

module.exports = HouseKeepingIntentHandlers;