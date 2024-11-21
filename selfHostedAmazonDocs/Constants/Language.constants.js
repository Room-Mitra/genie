const { HOTEL_NAME } = require("./Hotel.constants.js");

const languageStrings = {
    'en': {
        translation: {
            MandatoryIntent_LaunchRequestHandler_WelcomeMsg: `English : Hello, Welcome to ${HOTEL_NAME}. How can I help you?`
        }
    },
    'hi': {
        translation: {
            MandatoryIntent_LaunchRequestHandler_WelcomeMsg: `Hindi : Welcome to ${HOTEL_NAME}. How can I help you?`
        }
    }
}


module.exports = {
    languageStrings
}