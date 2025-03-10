const { getIntentsForDate } = require("./Intent.repository")

const TTL = 2 * 24 * 60 * 60 * 1000; // 2 days in milliseconds
const TTL_CHECKING_FREQUENCY = 1 * 60 * 60 * 1000; // 1 hour in ms
let TTL_TimerID = null;

let ALL_INTENTS = [];

const warmCache = async () => {
    const intents = await getIntentsForDate(Math.floor(Date.now() / (24 * 60 * 60 * 1000)));
    ALL_INTENTS = [...intents];
    console.log("INTENTS CACHE HAS BEEN WARMED  :  ", JSON.stringify(ALL_INTENTS));
    setTimerForTTL()
};

const setTimerForTTL = () => {
    if (TTL_TimerID) {
        clearInterval(TTL_TimerID);
        TTL_TimerID = null;
    }

    const clearIntentsBeyondTTL = () => {
        const timeNow = Date.now();
        ALL_INTENTS = ALL_INTENTS.filter((intent) => intent.requestedTime + TTL >= timeNow)
    }

    TTL_TimerID = setInterval(clearIntentsBeyondTTL, TTL_CHECKING_FREQUENCY)
}

const addIntent = (intent) => {
    ALL_INTENTS.push(intent);
    console.log(ALL_INTENTS)
}

const removeIntentIfExists = (intent) => {
    const intentIndex = ALL_INTENTS.findIndex((_intent) => _intent.requestedTime === intent.requestedTime);

    if (intentIndex !== -1) {
        ALL_INTENTS.splice(intentIndex, 1);
    }
}

const updateIntent = (intent) => {
    removeIntentIfExists(intent);
    addIntent(intent)
}

const updateMultipleIntents = (intents) => {
    intents.forEach(intent => updateIntent(intent));
}

const isIntentExists = (intent) => {
    const intentIndex = ALL_INTENTS.findIndex((_intent) => _intent.requestedTime === intent.requestedTime);
    return intentIndex != -1;
}

module.exports = { updateMultipleIntents, removeIntentIfExists, addIntent, warmCache, isIntentExists };
