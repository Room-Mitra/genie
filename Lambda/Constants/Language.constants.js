const { HOTEL_NAME } = require("./Hotel.constants.js");

const languageStrings = {
    'en': {
        translation: {
            LaunchRequestHandler_WelcomeMsg: `English : Hello, Welcome to ${HOTEL_NAME}. How can I help you?`,
            ErrorHandler_Prompt: 'English : Sorry, I don\'t understand your command. Please say it again.',
            ErrorHandler_Reprompt: 'English : Sorry, I don\'t understand your command. Please say it again.',
            HelpIntentHandler_HelpText: 'English: You can ask me the weather!',
            HelpIntentHandler_HelpTextDesc: 'English: DESC : You can ask me the weather!',
            CancelAndStopIntentHandler_short: 'English: Goodbye!',
            CancelAndStopIntentHandler_Desc: 'English: Goodbye!!!'
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
            CancelAndStopIntentHandler_Desc: 'Hindi: Goodbye!!!'

        }
    }
}


module.exports = {
    languageStrings
}