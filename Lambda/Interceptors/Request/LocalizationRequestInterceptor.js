const Alexa = require('ask-sdk-core');
const i18n = require('i18next');
const { languageStrings } = require("../../Constants/Language.constants.js");

const LocalizationRequestInterceptor = {
    process(handlerInput) {
        i18n.init({
            lng: Alexa.getLocale(handlerInput.requestEnvelope),
            resources: languageStrings
        }).then((t) => {
            handlerInput.t = (...args) => t(...args)
        })
    }
}


module.exports = { LocalizationRequestInterceptor }