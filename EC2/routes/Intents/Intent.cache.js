const { getDaysSinceEpoch } = require("../../common/services/common.service");
const TTL_IN_DAYS = 2;
const TTL_CHECKING_FREQUENCY = 24 * 60 * 60 * 1000; // 1 day in ms
let TTL_TimerID = null;

let ALL_INTENTS = {}


const warmCache = async () => {
    const { getIntentsForDateRange } = require("./Intent.service.js")

    const today_daysSinceEpoch = getDaysSinceEpoch(+Date.now());
    ALL_INTENTS = await getIntentsForDateRange(today_daysSinceEpoch, TTL_IN_DAYS, true);
    console.log("INTENTS CACHE HAS BEEN WARMED  ::  ", JSON.stringify(ALL_INTENTS));
    setTimerForTTL()
};


const setTimerForTTL = () => {
    if (TTL_TimerID) {
        clearInterval(TTL_TimerID);
        TTL_TimerID = null;
    }

    const clearIntentsBeyondTTL = () => {
        const today_daysSinceEpoch = getDaysSinceEpoch(+Date.now());
        Object.keys(ALL_INTENTS).forEach(daysSinceEpoch => {
            if (+daysSinceEpoch < today_daysSinceEpoch - TTL_IN_DAYS) {
                delete ALL_INTENTS[daysSinceEpoch];
            }
        })
    }

    TTL_TimerID = setInterval(clearIntentsBeyondTTL, TTL_CHECKING_FREQUENCY)
}

const addIntent = (intent) => {
    const daysSinceEpoch = getDaysSinceEpoch(intent.requestedTime);
    ALL_INTENTS[daysSinceEpoch] = ALL_INTENTS[daysSinceEpoch] || [];
    ALL_INTENTS[daysSinceEpoch].push(intent);
}

const removeIntentIfExists = (intent) => {
    const daysSinceEpoch = getDaysSinceEpoch(intent.requestedTime);
    const index = ALL_INTENTS[daysSinceEpoch].findIndex((i) => i.requestedTime === intent.requestedTime);
    if (index !== -1) {
        ALL_INTENTS[daysSinceEpoch].splice(index, 1);
    }
}

const updateIntent = (intent) => {
    removeIntentIfExists(intent);
    addIntent(intent)
}
const updateMultipleIntents = (intents) => {
    intents.forEach(intent => updateIntent(intent));
}

const getIntentsForDate = async (dateAsInteger) => {
    return ALL_INTENTS[dateAsInteger] || [];
}
module.exports = { updateMultipleIntents, removeIntentIfExists, addIntent, warmCache, getIntentsForDate };
