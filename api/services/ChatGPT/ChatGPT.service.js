import OpenAIClient from '#clients/OpenAI.client.js';
import { computeJaccardScore } from '#libs/ranking.js';
import { queryHotelMeta } from '#repositories/Hotel.repository.js';
import { getBookingById } from '#services/Booking.service.js';
import { getHotelById } from '#services/Hotel.service.js';
import { handleFetchMenuItems, handleFetchMenuSections } from '#services/Menu.service.js';
import { createRequest, listRequestsByBooking } from '#services/Request.service.js';
import { summarizeRequests } from './summarizers/request.summarizer.js';
import { create_hotel_requests } from './tools/create_hotel_requests.tool.js';
import { fetch_menu_items } from './tools/fetch_menu_items.tool.js';
import { fetch_menu_sections } from './tools/fetch_menu_sections.tool.js';
import { get_amenities } from './tools/get_amenities.tool.js';
import { get_booking_details } from './tools/get_booking_details.tool.js';
import { get_concierge_services } from './tools/get_concierge_services.tool.js';
import { get_hotel_details } from './tools/get_hotel_details.tool.js';
import { get_previous_requests } from './tools/get_previous_requests.tool.js';
import { order_food } from './tools/order_food.tool.js';

const GPT_MODEL = 'gpt-4.1-mini';

const BASE_SYSTEM = `
YOU ARE ROOM MITRA.
Interpret guest messages and respond as a hotel in-room assistant.

INTENTS

Detect ALL intents.

If any part needs an action, you MUST call the correct tool 
(house_keeping, facilities, room_service, etc.).

For food or drink orders, you MUST ask a short confirmation question 
BEFORE calling room_service.

TOOL USE

Call tools ONLY when needed.
Use ONLY valid items and arguments.
DO NOT invent item IDs.
DO NOT call tools for casual questions.

REPLY STYLE

MUST be conversational, polite, concise, and TTS-friendly.
DO NOT use brackets, emojis, acronyms, or meta-text.
If the guest asks something unrelated to hotel services, give a very short 
answer and DO NOT ask follow-ups unless required.


If message has mixed intents: Call tools for actionable parts

If simple info request: Short answer, no tool call.
`;

const METADATA_REQUIREMENT = `
METADATA REQUIREMENT

After EVERY reply, output:
<META>{"isUserResponseNeeded": true}</META> OR 
<META>{"isUserResponseNeeded": false}</META>

You MUST NOT OMIT THIS METADATA AT ANY COST!

Rules:

If you asked a question or need confirmation → MUST be true
Otherwise → MUST be false

`;

const MENU_ENQUIRY_PROMPT = `
MENU RULES

You MUST mention ONLY the menu sections that exist in the response from the
latest fetch_menu_sections tool result.

You MUST NOT mention any section that is not in fetch_menu_sections response.

You MUST NOT ask about “mains”, “snacks”, “desserts”, “drinks”, or any other
section unless they exist in available_sections.

When listing sections, you SHOULD start with 4 to 6 sections and then ask if the
guest wants to hear more.

DO NOT include the section descriptions when listing the sections.

If only one section exists, you MUST say so and proceed with that section.

DISH AVAILABILITY

You MUST mention ONLY the items that exist in response of the latest fetch_menu_items tool result

You MUST verify if the item exists in fetch_menu_items response before telling the guest the 
item does not exist

You MUST NOT list more than 10 items at a time when the guest wants to explore dishes.

You MUST narrow down the menu exploring by passing in maxItems to 
fetch_menu_items tool call.

You MUST ask the guest if they would like to hear more after the initial 10.

DO NOT include item descriptions when listing items.

ONLY get the description of the item if the guest askes for it specifically.

If the guest asks for a dish that is not on the menu:

You MUST politely say it is not available.

You SHOULD suggest a similar dish if one exists.

If no similar dish exists, you MUST say so and take no further action.

SECTION VALIDATION

Menu sections are dynamic per hotel.

If the guest asks for a section that does not exist, you MUST politely say it 
isn’t available and mention only the valid sections.

TONE

You MUST describe sections and dishes in a warm, conversational waiter style.
`;

const ORDER_FOOD_PROMPT = `
ORDER VALIDATION

You MUST verify every requested food or drink item from the fetch_menu_items tool result.

If an item is NOT found you MUST politely say it is unavailable and suggest similar items.

You MUST NOT confirm, mention, or offer any item that is not in the menu.

CONFIRMATION RULES

You MUST ask for a short confirmation before placing any food or drink order.

DO NOT send the confirmation question and the order_food tool call in the same assistant message.

You MUST wait for the guest’s reply.

You MUST call order_food only after the guest confirms.

DO NOT call order_food without explicit confirmation.

Example confirmation pattern:
“You asked for two pumpkin soups and one black coffee. Shall I place the order?”

NOTES AND CART RULES

When constructing the cart, you MUST provide the correct itemId from obtained from fetch_menu_items.

You MUST NOT invent or guess itemId values.

You MUST NOT mismatch itemId of one item with another item

If the true itemId cannot be found, you MUST fall back to the item name only.

You MUST include item notes ONLY if the guest explicitly provides them.

If the guest gives no notes, you MUST send blank notes.

You MUST include ONLY the items the guest clearly requested.

You MUST NOT add extra items, extra notes, or any instructions not stated by the guest.

SPLIT QUANTITY (“2 BY 4”, “3 BY 4”) RULE

If the guest says “2 by 4”, “3 by 4”, or any pattern like <X> by <Y>, you MUST interpret the quantity as X.

You MUST add an item note requesting extra serving containers based on the dish type.

For soups, you MUST add notes like “send extra bowls”.

For solid dishes, you MUST add notes like “send extra plates”.

Example Pattern

Guest: “I want 2 by 4 tomato soups.”

You MUST:

Set quantity to 2

Add item note: “send two extra bowls”

`;

const MUSIC_PROMPT = `
MUSIC PLAYER RULES

If the guest asks to play music, you MUST NOT call any hotel service tools.

You MUST instruct the local app using a JSON metadata block with an "agents"
array.

You MUST output the metadata on a single line as:
<META>{"agents": [{"type": "Music","parameters": [...] }]}</META>

SONG NAMING REQUIREMENTS

You MUST provide fully qualified song identifiers to avoid ambiguity.

For EVERY song in the "parameters" array, you MUST include:
- Artist name
- Song title
- And when needed to avoid conflicts, the album or movie name

Format each item as:
"Artist – Song Title (Album or Movie)"

Examples:
"Kishore Kumar – Pal Pal Dil Ke Paas (Blackmail 1973)"
"A. R. Rahman – Dil Se Re (Dil Se, 1998)"

You MUST NOT return vague or ambiguous titles like "Pal Pal Dil Ke Paas".
You MUST always prefix with the correct artist and include album or movie if
other songs share the same title.

INVOCATION FORMAT

If the guest requests a specific song, you MUST provide 10–15 similar songs,
each using the full "Artist – Song Title (Album/Movie)" format.

If the guest requests an artist or playlist (e.g., “play A. R. Rahman songs”),
you MUST return 10–15 representative songs by that artist using the full
format.

Example:
<META>{"agents": [{"type": "Music","parameters": [
  "Kishore Kumar – Pal Pal Dil Ke Paas (Blackmail 1973)",
  "Kishore Kumar – O Mere Dil Ke Chain (Mere Jeevan Saathi 1972)",
  "Kishore Kumar – Chala Jata Hoon (Mere Jeevan Saathi 1972)"
]}]}</META>

STOP MUSIC

If the guest says “stop” or “stop the music”, you MUST return:
<META>{"agents": [{"type": "Music","parameters": []}]}</META>

NO TOOL CALLS

Music actions MUST be handled ONLY through "agents" metadata.

You MUST NOT trigger hotel requests or create_hotel_requests tool calls.

NO FOLLOW-UP QUESTION

When handling music requests (including artist or playlist requests), you
MUST NOT end with a question.

"isUserResponseNeeded" MUST be false for all music actions.
`;

export async function discoverIntents({ userText, messagesInConversation }) {
  const resp = await OpenAIClient.responses.create({
    model: GPT_MODEL,
    text: {
      format: {
        name: 'intent',
        type: 'json_schema',
        strict: true,
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            intents: {
              type: 'array',
              description: 'one or maximum two best intents for this query',
              items: {
                type: 'string',
                enum: [
                  'create_hotel_request',
                  'order_food',
                  'menu_enquiry',
                  'fetch_menu_items',
                  'fetch_menu_sections',
                  'get_amenities',
                  'get_concierge',
                  'get_hotel_details',
                  'get_booking_details',
                  'get_previous_requests',
                  'order_status',
                  'request_status',
                  'cancel_request',
                  'modify_request',
                  'play_music',
                  'stop_music',
                  'get_hours',
                  'get_directions',
                  'get_contact',
                  'get_billing_info',
                  'leave_feedback',
                  'help',
                  'repeat',
                  'cancel',
                  'small_talk',
                  'general_knowledge',
                  'out_of_scope',
                  'unknown',
                  'negative_confirmation',
                ],
              },
            },
            confidence: { type: 'number' },
          },
          required: ['intents', 'confidence'],
        },
      },
    },
    input: [
      {
        role: 'system',
        content: [
          {
            type: 'input_text',
            text:
              "Classify the user's ask into one or two intent" +
              'Return ONLY JSON matching the schema.',
          },
        ],
      },

      ...messagesInConversation,
      {
        role: 'user',
        content: [{ type: 'input_text', text: userText }],
      },
    ],
  });

  // Extract JSON from the Responses API output
  const msg = (resp.output || []).find((o) => o.type === 'message');
  const textParts = (msg?.content || [])
    .filter((c) => c.type === 'output_text' && typeof c.text === 'string')
    .map((c) => c.text);

  if (!textParts?.length) throw new Error('No output_text returned by router');

  const raw = textParts.join('').trim();
  // Strip accidental code fences if any
  const cleaned = raw.replace(/^```json\s*|\s*```$/g, '');
  return JSON.parse(cleaned); // { intent, slots, confidence }
}

function getPromptAndToolsForIntents({ intents }) {
  const tools = [];
  const toolSet = new Set();

  const prompts = [];
  const promptSet = new Set();

  for (const intent of intents) {
    switch (intent) {
      case 'create_hotel_request': {
        toolSet.add(create_hotel_requests);
        continue;
      }
      case 'order_food': {
        toolSet.add(fetch_menu_items);
        toolSet.add(order_food);

        promptSet.add(MENU_ENQUIRY_PROMPT);
        promptSet.add(ORDER_FOOD_PROMPT);

        continue;
      }

      case 'menu_enquiry': {
        toolSet.add(fetch_menu_items);

        promptSet.add(MENU_ENQUIRY_PROMPT);

        continue;
      }

      case 'fetch_menu_items': {
        toolSet.add(fetch_menu_items);
        toolSet.add(fetch_menu_sections);

        promptSet.add(MENU_ENQUIRY_PROMPT);

        continue;
      }

      case 'fetch_menu_sections': {
        toolSet.add(fetch_menu_items);
        toolSet.add(fetch_menu_sections);

        promptSet.add(MENU_ENQUIRY_PROMPT);

        continue;
      }

      case 'get_amenities': {
        toolSet.add(get_amenities);
        continue;
      }
      case 'get_concierge': {
        toolSet.add(get_concierge_services);
        toolSet.add(create_hotel_requests);
        continue;
      }
      case 'get_hotel_details': {
        toolSet.add(get_hotel_details);
        continue;
      }
      case 'get_booking_details': {
        toolSet.add(get_booking_details);
        continue;
      }
      case 'get_previous_requests': {
        toolSet.add(get_previous_requests);
        continue;
      }
      case 'order_status': {
        toolSet.add(get_previous_requests);
        continue;
      }
      case 'request_status': {
        toolSet.add(get_previous_requests);
        continue;
      }
      case 'cancel_request': {
        toolSet.add(get_previous_requests);
        toolSet.add(create_hotel_requests);
        continue;
      }
      case 'modify_request': {
        toolSet.add(get_previous_requests);
        toolSet.add(create_hotel_requests);
        continue;
      }
      case 'play_music': {
        promptSet.add(MUSIC_PROMPT);

        continue;
      }
      case 'stop_music': {
        promptSet.add(MUSIC_PROMPT);

        continue;
      }
      case 'get_hours': {
        continue;
      }
      case 'get_directions': {
        toolSet.add(get_hotel_details);
        continue;
      }
      case 'get_contact': {
        toolSet.add(get_hotel_details);
        continue;
      }
      case 'get_billing_info': {
        toolSet.add(create_hotel_requests);
        toolSet.add(get_booking_details);
        continue;
      }
      case 'leave_feedback': {
        toolSet.add(create_hotel_requests);
        continue;
      }
      case 'help': {
        toolSet.add(create_hotel_requests);
        continue;
      }
      case 'repeat': {
        continue;
      }
      case 'cancel': {
        continue;
      }
      case 'small_talk': {
        continue;
      }
      case 'general_knowledge': {
        continue;
      }
      case 'out_of_scope': {
        continue;
      }
      case 'unknown': {
        continue;
      }
      case 'negative_confirmation': {
        continue;
      }
    }
  }

  for (const tool of toolSet) {
    tools.push(tool);
  }

  for (const prompt of promptSet) {
    prompts.push(prompt);
  }

  return { tools, prompts };
}

const callFunction = async ({
  name,
  args,
  hotelId,
  roomId,
  deviceId,
  bookingId,
  conversationId,
  guestUserId,
  conversationState,
}) => {
  switch (name) {
    case 'fetch_menu_items': {
      if (args.vegOnly === undefined || args.vegOnly === null)
        args.vegOnly = conversationState.vegOnly;

      if (args.veganOnly === undefined || args.veganOnly === null)
        args.veganOnly = conversationState.veganOnly;

      if (args.glutenFree === undefined || args.glutenFree === null)
        args.glutenFree = conversationState.glutenFree;

      if (args.excludeAllergens === undefined || args.excludeAllergens === null)
        args.excludeAllergens = conversationState.excludeAllergens;

      return await handleFetchMenuItems({ hotelId, args });
    }

    case 'fetch_menu_sections':
      return await handleFetchMenuSections({ hotelId, args });

    case 'get_amenities':
      return await queryHotelMeta({ hotelId, entityType: 'AMENITY' });

    case 'get_booking_details': {
      return await getBookingById({ hotelId, bookingId });
    }

    case 'get_concierge_services':
      return await queryHotelMeta({ hotelId, entityType: 'CONCIERGE' });

    case 'get_hotel_details':
      return await getHotelById(hotelId);

    case 'get_previous_requests': {
      const requests = await listRequestsByBooking({ bookingId: bookingId });
      return summarizeRequests(requests.items);
    }

    case 'create_hotel_requests':
      return create_hotel_requests_handler({
        args,
        hotelId,
        roomId,
        deviceId,
        bookingId,
        conversationId,
        guestUserId,
      });

    case 'order_food':
      return create_hotel_requests_handler({
        args: {
          requests: [
            {
              department: 'room_service',
              requestType: args.requestType,
              details: args.details,
              priority: 'high',
              cart: args.cart,
            },
          ],
        },
        hotelId,
        roomId,
        deviceId,
        bookingId,
        conversationId,
        guestUserId,
      });
  }
};

function collectReplyTexts(resp) {
  if (!resp?.output) return null;

  let isUserResponseNeeded = null;
  let agents = [];

  // 1) Keep only assistant messages in this response
  const assistantMsgs = resp.output.filter((o) => o.type === 'message' && o.role === 'assistant');

  if (assistantMsgs.length === 0) return null;

  // 2) Collect ALL output_text chunks from ALL assistant messages, in order
  const rawTexts = [];
  for (const msg of assistantMsgs) {
    for (const c of msg.content || []) {
      if (c.type === 'output_text' && typeof c.text === 'string') {
        const trimmed = c.text.trim();
        if (trimmed) rawTexts.push(trimmed);
      }
    }
  }

  if (rawTexts.length === 0) return null;

  // 3) Deduplicate consecutive identical texts (fixes "Manchow" × 20 type issues)
  const deduped = [];
  for (const t of rawTexts) {
    if (!deduped.length || computeJaccardScore(deduped[deduped.length - 1], t) < 3) {
      deduped.push(t);
    }
  }

  // 4) Join into one final string for this response
  // Use a space to avoid sticking sentences together
  let finalText = deduped.join(' ').trim();
  if (!finalText) return null;

  const originalTextForMetaCheck = finalText;

  // 5) Prefer META-wrapped JSON blocks: <META>{...}</META>
  const META_RE = /<META>\s*({[\s\S]*?})\s*<\/META>/g;
  finalText = finalText
    .replace(META_RE, (full, jsonStr) => {
      try {
        const meta = JSON.parse(jsonStr);
        if (typeof meta.isUserResponseNeeded === 'boolean') {
          isUserResponseNeeded = meta.isUserResponseNeeded;
        }
        if (Array.isArray(meta.agents)) {
          agents = meta.agents;
        }
      } catch (e) {
        console.error('META parse error:', e);
      }
      return ''; // strip meta from user-facing text
    })
    .trim();

  // 6) Fallback: scan lines for standalone JSON blocks IF there were no META markers
  if (!/<META>/.test(originalTextForMetaCheck)) {
    const lines = finalText.split('\n');
    const kept = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        try {
          const obj = JSON.parse(trimmed);
          if (typeof obj.isUserResponseNeeded === 'boolean') {
            isUserResponseNeeded = obj.isUserResponseNeeded;
            continue; // don't keep this line in reply text
          }
          if (Array.isArray(obj.agents)) {
            agents = obj.agents;
            continue;
          }
        } catch (e) {
          // not valid JSON; keep it
        }
      }
      kept.push(line);
    }
    finalText = kept.join('\n').trim();
  }

  // 7) If META / JSON didn’t say anything, infer from punctuation of final text
  if (isUserResponseNeeded === null) {
    const endsWithQuestion = /\?/.test(finalText);
    isUserResponseNeeded = endsWithQuestion;
  }

  return { replyText: finalText, agents, isUserResponseNeeded };
}

async function create_hotel_requests_handler({
  args,
  hotelId,
  roomId,
  deviceId,
  bookingId,
  conversationId,
  guestUserId,
}) {
  const requests = await Promise.all(
    args?.requests?.map((a) => {
      return createRequest({
        hotelId,
        roomId,
        deviceId,
        bookingId,
        conversationId,
        guestUserId,

        department: a.department,
        requestType: a.requestType,
        details: a.details,
        priority: a.priority,
        cart: a.cart,
      });
    })
  );

  return summarizeRequests(requests);
}

export async function askChatGpt({
  userText,
  messagesInConversation,
  hotelId,
  roomId,
  deviceId,
  bookingId,
  conversationId,
  guestUserId,
  conversationState,
}) {
  // 1) Default conversation state
  if (!conversationState) {
    conversationState = {
      menu_items: [],
    };
  }

  // 2) Discover intents and tools/prompts
  const intentResp = await discoverIntents({ userText, messagesInConversation });
  const { tools, prompts } = getPromptAndToolsForIntents({
    intents: intentResp.intents,
  });

  // 3) Build base input for the first call
  const baseInput = [
    {
      role: 'system',
      content: [
        BASE_SYSTEM,
        METADATA_REQUIREMENT,
        ...prompts,
        JSON.stringify({ state: conversationState }),
        METADATA_REQUIREMENT,
      ].join('\n\n'),
    },
    { role: 'user', content: userText },
  ];

  const MAX_LOOPS = 6;
  let previousResponseId = conversationState.previousResponseId;

  // This will hold the best/latest assistant reply we saw across all steps
  let lastReplyMeta = null;

  // Helper: single model step
  async function step({ input, instructions } = {}) {
    const args = { model: GPT_MODEL, tools };

    // For tool outputs, we override input
    if (input) {
      args.input = input;
    }

    if (previousResponseId) {
      // Continue an existing Responses API conversation
      args.previous_response_id = previousResponseId;
    }

    if (!previousResponseId || !args.input) {
      // First call: provide the full baseInput
      args.input = baseInput;
    }

    if (instructions) {
      args.instructions = instructions;
    }

    const resp = await OpenAIClient.responses.create(args);
    previousResponseId = resp.id;
    return resp;
  }

  // Helper: extract all function calls from a response
  function getFunctionCalls(resp) {
    const out = resp.output || [];
    return out.filter((o) => o.type === 'function_call');
  }

  // Helper: update lastReplyMeta from a response
  function captureReply(resp) {
    const reply = collectReplyTexts(resp);
    if (reply && reply.replyText) {
      lastReplyMeta = reply; // overwrite older one
    }
  }

  // 4) First turn
  let resp = await step({});
  captureReply(resp);
  conversationState.previousResponseId = previousResponseId;

  // 5) Tool loop
  for (let i = 0; i < MAX_LOOPS; i++) {
    const toolCalls = getFunctionCalls(resp);

    // If there are no function calls, we are done
    if (!toolCalls.length) {
      break;
    }

    // Resolve all tool calls in parallel
    const toolResults = await Promise.all(
      toolCalls.map(async (tc) => {
        let args = {};
        try {
          args = tc.arguments ? JSON.parse(tc.arguments) : {};
        } catch (e) {
          console.error('error parsing tool call args', e);
        }

        const output = await callFunction({
          name: tc.name,
          args,
          hotelId,
          roomId,
          deviceId,
          bookingId,
          conversationId,
          guestUserId,
          conversationState,
        });

        if (tc.name === 'fetch_menu_items') {
          const getBool = (a, b) => (typeof a === 'boolean' ? a : b);
          const existingItems = conversationState.menu_items || [];
          const existingItemsSet = new Set(existingItems.map((i) => i.itemId));
          conversationState.menu_items = [
            ...existingItems,
            ...output.filter((i) => !existingItemsSet.has(i.itemId)),
          ];

          conversationState.vegOnly = getBool(args.vegOnly, conversationState.vegOnly);
          conversationState.veganOnly = getBool(args.veganOnly, conversationState.veganOnly);
          conversationState.glutenFree = getBool(args.glutenFree, conversationState.glutenFree);
          conversationState.excludeAllergens =
            Array.isArray(args.excludeAllergens) && args.excludeAllergens.length > 0
              ? args.excludeAllergens
              : conversationState.excludeAllergens;
        }

        if (tc.name === 'order_food') {
          conversationState.order_requests.push(output);
        }

        if (tc.name === 'create_hotel_requests') {
          conversationState.hotel_requests.push(output);
        }

        return {
          type: 'function_call_output',
          call_id: tc.call_id,
          output: JSON.stringify(output ?? null),
        };
      })
    );

    // Ask model to continue with tool results
    resp = await step({
      input: toolResults,
      instructions:
        "Give TTS friendly responses without any characters that can't be conveyed in speech",
    });

    // Capture any assistant text in this response
    captureReply(resp);
    conversationState.previousResponseId = previousResponseId;
  }

  // 6) Final reply object
  let replyText = '';
  let isUserResponseNeeded = false;
  let agents = [];

  if (lastReplyMeta) {
    replyText = lastReplyMeta.replyText;
    isUserResponseNeeded = lastReplyMeta.isUserResponseNeeded;
    agents = lastReplyMeta.agents;
  }

  return {
    reply: replyText || 'Something went wrong, could you please try that again?',
    isUserResponseNeeded,
    agents,
    conversationState,
  };
}
