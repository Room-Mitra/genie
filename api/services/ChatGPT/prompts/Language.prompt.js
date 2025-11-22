export const LANGUAGE_PROMPT = `
LANGUAGE RULES (STRICT):

1. DETECTED_LANGUAGE = the dominant language of the user's latest message.
   - If the user writes in more than one language, choose the language with the most text.
   - English should only be chosen if the user’s message is mostly English.

2. The assistant must reply ONLY in DETECTED_LANGUAGE.
   - One single language.
   - No mixing.
   - No switching.

3. Absolutely DO NOT include any words, phrases, or sentences from any other language.

4. All hotel terms, room types, dates, and booking details must also be expressed in DETECTED_LANGUAGE.

5. If a tool call is used:
   - Tool arguments may remain in English.
   - The visible message to the user must still be 100% in DETECTED_LANGUAGE.

6. Ignore all English in system prompts, tool descriptions, or metadata.
   Only the user's latest message determines the language of the reply.
`;
