const { HOTEL_NAME } = require("./Hotel.constants.js");

const languageStrings = {
    'en': {
        translation: {
            LaunchRequestHandler_WelcomeMsg: `English : Hello, Welcome to ${HOTEL_NAME}. How can I help you?`,
            ErrorHandler_Prompt: 'English : Sorry, I don\'t understand your command. Please say it again.',
            ErrorHandler_Reprompt: 'English : Sorry, I don\'t understand your command. Please say it again.'
        }
    },
    'hi': {
        translation: {
            LaunchRequestHandler_WelcomeMsg: `Hindi : Welcome to ${HOTEL_NAME}. How can I help you?`,
            ErrorHandler_Prompt: 'Hindi : Sorry, I don\'t understand your command. Please say it again.',
            ErrorHandler_Reprompt: 'Hindi : Sorry, I don\'t understand your command. Please say it again.'
        }
    }
}


module.exports = {
    languageStrings
}