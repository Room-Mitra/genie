const request = require('sync-request');
const OPENAI_API_KEY = require('./config.js').OPENAI_API_KEY;

function buildPrompt(history) {
    const systemMsg = `You are Room Mitra,
     you are an alexa skill based smart hotel assistant placed in cottages in Ananterra resort in Wayanad,Kerala. 
     Understand guest requests and respond politely. 
     If needed, ask follow-up questions **only when absolutely necessary**.
     If the user request is in another language, reply in the same language as the user input language, but use English script.
     If the user asks anything not related to the hotel, its service, conceirge service, or room, Keep the reply short, and do not ask follow up questions.
     Format your reply in JSON with fields: messages[], department, roomNumber (if known), clarificationNeeded (true/false), type ('single' | 'multi').`;

    return [
        { role: 'system', content: systemMsg },
        ...history,
    ];
}

function callChatGptApi(messages) {

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

function parseGptResponse(gptResponse) {
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

function addToSessionHistory(session, role, content) {
    session.history.push({ role, content });
}

module.exports = {
    buildPrompt,
    callChatGptApi,
    parseGptResponse,
    addToSessionHistory
};