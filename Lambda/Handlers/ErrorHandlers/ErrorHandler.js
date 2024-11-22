


const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`Error handled: ${error.message}`);

        return handlerInput.responseBuilder
            .speak(handlerInput.t('ErrorHandler_Prompt'))
            .reprompt(handlerInput.t('ErrorHandler_Reprompt'))
            .getResponse();
    }
};

module.exports = { ErrorHandler };

