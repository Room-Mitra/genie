import { getIntentsForDateRange } from '#services/Intent.service.js';

const TTL_IN_DAYS = 2;
const TTL_CHECKING_FREQUENCY = 24 * 60 * 60 * 1000; // 1 day in ms
let TTL_TimerID = null;

let ALL_INTENTS = {};

const getDaysSinceEpoch = (timeStamp) => {
  const date = new Date(+timeStamp);
  return Math.floor(date.getTime() / (24 * 60 * 60 * 1000));
};

export const warmCache = async () => {
  const today_daysSinceEpoch = getDaysSinceEpoch(+Date.now());
  ALL_INTENTS = await getIntentsForDateRange(today_daysSinceEpoch, TTL_IN_DAYS, true);
  setTimerForTTL();
};

const setTimerForTTL = () => {
  if (TTL_TimerID) {
    clearInterval(TTL_TimerID);
    TTL_TimerID = null;
  }

  const clearIntentsBeyondTTL = () => {
    const today_daysSinceEpoch = getDaysSinceEpoch(+Date.now());
    Object.keys(ALL_INTENTS).forEach((daysSinceEpoch) => {
      if (+daysSinceEpoch < today_daysSinceEpoch - TTL_IN_DAYS) {
        delete ALL_INTENTS[daysSinceEpoch];
      }
    });
  };

  TTL_TimerID = setInterval(clearIntentsBeyondTTL, TTL_CHECKING_FREQUENCY);
};

export const addIntent = (intent) => {
  const daysSinceEpoch = getDaysSinceEpoch(intent.requestedTime);
  ALL_INTENTS[daysSinceEpoch] = ALL_INTENTS[daysSinceEpoch] || [];
  removeIntentIfExists(intent);
  ALL_INTENTS[daysSinceEpoch].push(intent);
};

export const removeIntentIfExists = (intent) => {
  const daysSinceEpoch = getDaysSinceEpoch(intent.requestedTime);
  const index = ALL_INTENTS[daysSinceEpoch].findIndex(
    (i) => i.requestedTime === intent.requestedTime
  );
  if (index !== -1) {
    ALL_INTENTS[daysSinceEpoch].splice(index, 1);
  }
};

const updateIntent = (intent) => {
  removeIntentIfExists(intent);
  addIntent(intent);
};
export const updateMultipleIntents = (intents) => {
  intents.forEach((intent) => updateIntent(intent));
};

export const getIntentsForDate = async (dateAsInteger) => {
  return ALL_INTENTS[dateAsInteger] || [];
};
