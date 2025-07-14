const { getHotelPromopts } = require('./Utterance.repository');
const SessionManager = require('./SessionManager');
const { callChatGptApi, parseGptResponse } = require('./ChatGpt');
const { registerIntent } = require('../Intents/Intent.service');

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

    console.log(`ChatGPT response for sessionId = ${sessionId} is`, { raw, parsed })

    registerRequests(parsed.requestDetails || [])

    let responseSpeech = 'Okay.';
    if (parsed && Array.isArray(parsed.messages)) {
        responseSpeech = parsed.messages.join(' ');
        return {
            speech: responseSpeech,
            isSessionOpen: true //parsed.isUserResponseNeeded
        }

    }
    return ERROR_RESPONSE;
}


const registerRequests = (requestDetails) => {
    requestDetails.forEach(r => {
        console.log("Request :: ", JSON.stringify(r));
        const { deviceId, hasUserConfirmedOrder, department, requestType, shortDescription } = r;
        if (hasUserConfirmedOrder) {
            const intent = {
                deviceId,
                intentName: requestType,
                intentType: department,
                requestedTime: Date.now(),
                inProgressTime: null,
                completedTime: null,
                notes: shortDescription
            }
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

module.exports = {
    onUtterance
}