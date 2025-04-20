const { HOTEL_NAME } = require("./Hotel.constants.js");

const languageStrings = {
    'en': {
        translation: {
            LaunchRequestHandler_WelcomeMsg: `English : Hello, Welcome to ${HOTEL_NAME}. How can I help you?`,
            ErrorHandler_Prompt: 'English : Sorry, I don\'t understand your command. Please say it again.',
            ErrorHandler_Reprompt: 'English : Sorry, I don\'t understand your command. Please say it again.',
            HelpIntentHandler_HelpText: ' You can ask me the weather!',
            HelpIntentHandler_HelpTextDesc: ' DESC : You can ask me the weather!',
            CancelAndStopIntentHandler_short: ' Goodbye!',
            CancelAndStopIntentHandler_Desc: ' Goodbye!!!',
            RedgisterDeviceHandler_DeviceRegistered: ' Device Registered Successfully',
            HouseKeepingDentalKitHandlerConfirmRequest: ' Dental Kit is on it\'s way to your room',
            HouseKeepingToiletriesHandlerConfirmRequest: ' Toiletries is on it\'s way to your room',
            HouseKeepingRoomCleanHandlerConfirmRequest: ' Sending someone to clean your room',
            HouseKeepingBeddingHandlerConfirmRequest: ' Absolutely! I will have it delivered to your room! Sweet Dreams',
            HouseKeepingTowelsHandlerConfirmRequest: ' Absolutely! I will have it delivered to your room!',
        }
    },
    'hi': {
        translation: {
            LaunchRequestHandler_WelcomeMsg: `Hindi : Welcome to ${HOTEL_NAME}. How can I help you?`,
            ErrorHandler_Prompt: 'Hindi : Sorry, I don\'t understand your command. Please say it again.',
            ErrorHandler_Reprompt: 'Hindi : Sorry, I don\'t understand your command. Please say it again.',
            HelpIntentHandler_HelpText: 'Hindi: You can ask me the weather!',
            HelpIntentHandler_HelpTextDesc: 'Hindi: DESC : You can ask me the weather!',
            CancelAndStopIntentHandler_short: 'Hindi : Goodbye!',
            CancelAndStopIntentHandler_Desc: 'Hindi: Goodbye!!!',
            RedgisterDeviceHandler_DeviceRegistered: 'Hindi: Device Registered Successfully',
            HouseKeepingDentalKitHandlerConfirmRequest: 'Hindi: Dental Kit is on it\'s way to your room',
            HouseKeepingToiletriesHandlerConfirmRequest: 'Hindi: Toiletries is on it\'s way to your room',
            HouseKeepingRoomCleanHandlerConfirmRequest: 'Hindi: Sending someone to clean your room',
            HouseKeepingBeddingHandlerConfirmRequest: 'Hindi: Absolutely! I will have it delivered to your room! Sweet Dreams',


        }
    }
}


module.exports = {
    languageStrings
}