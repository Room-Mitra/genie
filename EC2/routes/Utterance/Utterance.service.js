const { getHotelPromopts } = require('./Utterance.repository');
const SessionManager = require('./SessionManager');
const { callChatGptApi, parseGptResponse } = require('./ChatGpt');
const { registerIntent } = require('../Intents/Intent.service');
const { registerDevice } = require('../Device/Device.service');

const ERROR_RESPONSE = {
    speech: "Sorry, something went wrong. Please try again later",
    isSessionOpen: false
}

const onUtterance = async (userQuery, hotelId, deviceId, sessionId) => {
    const session = SessionManager.getSession(sessionId);
    SessionManager.addToSessionHistory(sessionId, 'user', userQuery);

    const messages = buildPrompt(hotelId, session.history);
    const gptResponse = callChatGptApi(messages);
    if (gptResponse.statusCode !== 200) {
        console.error('Failed GPT call:', gptResponse.statusCode);
        const gptText = JSON.parse(gptResponse.getBody('utf8'));
        console.error('Error Text ::', gptText);
        return ERROR_RESPONSE;
    }
    const { raw, parsed } = parseGptResponse(gptResponse);
    SessionManager.addToSessionHistory(sessionId, 'assistant', raw);

    console.log(`ChatGPT response for sessionId = ${sessionId} is :: `, { raw, parsed })

    registerRequests(deviceId, parsed.requestDetails || [])

    let responseSpeech = 'Okay.';
    if (parsed && Array.isArray(parsed.messages)) {
        responseSpeech = parsed.messages.join(' ');
        return {
            speech: responseSpeech,
            isSessionOpen: parsed.isUserResponseNeeded
        }

    }
    return ERROR_RESPONSE;
}


const registerRequests = (deviceId, requestDetails) => {
    requestDetails.forEach(r => {
        console.log("Request :: ", JSON.stringify(r));
        const { hasUserConfirmedOrder, department, requestType, shortDescription } = r;
        const intent = {
            deviceId,
            intentName: requestType,
            intentType: department,
            requestedTime: Date.now(),
            inProgressTime: null,
            completedTime: null,
            notes: shortDescription,
            daysSinceEpoch: Math.floor(Date.now() / (24 * 60 * 60 * 1000)) //PK
        }
        if ((department === "Restaurant" || department === "Room Service")) {
            hasUserConfirmedOrder && registerIntent(intent);
        } else {
            registerIntent(intent)
        }
    })
}

const buildPrompt = (hotelId, history) => {
    return [
        ...getHotelPromopts(hotelId),
        ...history,
    ];
}


/** this function returns true if the user utterance was related to an admisnitrative task, else returns false. 
 * if the task is an administrative action, it also 
 */
const handleAdministrativeUtterances = ({ userQuery, sessionId, deviceId, hotelId = "Room Mitra" }) => {

    // CASE REGISTER THIS DEVICE
    const phrase = "register this device with room"
    if (userQuery.toLocaleLowerCase().includes(phrase)) {
        const roomId = userQuery.split(phrase)[1].trim();
        const deviceDetails = {
            roomId,
            deviceId,
            hotelId,
            registeredAtUTC: new Date().toISOString()
        }
        console.info("Attempting to register device with details : ", deviceDetails)
        registerDevice(deviceDetails)
        return true;
    }

    return false;
}

module.exports = {
    onUtterance, handleAdministrativeUtterances
}