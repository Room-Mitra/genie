const request = require('sync-request');

const ERROR_RESPONSE = {
    speech: "Sorry, something went wrong.",
    isSessionOpen: false
}

const onUtterance = async (userQuery, hotelId, deviceId, sessionId) => {
    const session = getSession(sessionId);
    addToSessionHistory(session, 'user', userQuery);

    const messages = buildPrompt(session.history);
    const gptResponse = callChatGptApi(messages);

    if (gptResponse.statusCode !== 200) {
        console.error('Failed GPT call:', gptResponse.statusCode);
        return ERROR_RESPONSE;
    }
    const { raw, parsed } = parseGptResponse(gptResponse);
    addToSessionHistory(session, 'assistant', raw);

    console.log({ raw, parsed, session: JSON.stringify(session) })

    let responseSpeech = 'Okay.';
    if (parsed && Array.isArray(parsed.messages)) {
        responseSpeech = parsed.messages.join(' ');
        return {
            speech: responseSpeech,
            isSessionOpen: parsed.clarificationNeeded
        }

    }
    return ERROR_RESPONSE;
}


let sessionAttributes = {}; // TODO :: Add TTL to sessionIds
const getSession = (sessionId) => {
    if (!sessionAttributes[sessionId]) sessionAttributes[sessionId] = { history: [] };
    const session = sessionAttributes[sessionId];
    return session;
}

const addToSessionHistory = (session, role, content) => {
    session.history.push({ role, content });
}


const buildPrompt = (history) => {
    // TODO :: get systemMsg from DB based on hotelId 
    const systemMsg = `You are Room Mitra,
     you are an alexa skill based smart hotel assistant placed in cottages in Ananterra resort in Wayanad,Kerala. 
     Understand guest requests and respond politely. 
     If needed, ask follow-up questions only when necessary.
     If the user request is in another language, reply in the same language as the user input language, but use English script.
     If the user asks anything not related to the hotel, its service, conceirge service, or room, Keep the reply short, and do not ask follow up questions.
     Format your reply in JSON with fields: messages[], department, clarificationNeeded (true/false).
     clarificationNeeded should be set to true if a user input is required after providing your response. clarificationNeeded should be true if you are ending your response with a question`;

    return [
        { role: 'system', content: systemMsg },
        ...history,
    ];
}

const callChatGptApi = (messages) => {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    return request("POST", 'https://api.openai.com/v1/chat/completions',
        {
            headers: {
                Authorization: `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4.1-nano',
                messages,
                temperature: 0.4,
            })
        });
}

const parseGptResponse = (gptResponse) => {
    const gptText = JSON.parse(gptResponse.getBody('utf8'));
    const gptMessage = gptText.choices[0].message.content;
    let parsed = null;

    try {
        parsed = JSON.parse(gptMessage);
    } catch (e) {
        console.error('Failed to parse GPT response as JSON:', e);
    }

    return {
        raw: gptMessage,
        parsed,
        full: gptText
    };
}

module.exports = {
    onUtterance
}