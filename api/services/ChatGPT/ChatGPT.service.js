import OpenAIClient from '#clients/OpenAI.client.js';
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

const callFunction = async ({
  name,
  args,
  hotelId,
  roomId,
  deviceId,
  bookingId,
  conversationId,
  guestUserId,
}) => {
  switch (name) {
    case 'fetch_menu_items':
      return await handleFetchMenuItems({ hotelId, args });

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
      return summarizeRequests(await listRequestsByBooking({ bookingId: bookingId }));
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
  console.log(JSON.stringify(resp, null, 2));

  if (!resp?.output) return;

  let isUserResponseNeeded = null;
  let agents = [];
  const replyParts = [];

  // Gather all assistant text chunks for this turn
  const textBlobs = [];
  const msgs = resp.output.filter((o) => o.type === 'message');
  for (const m of msgs) {
    for (const c of m.content || []) {
      if (c.type === 'output_text' && typeof c.text === 'string') {
        textBlobs.push(c.text);
      }
    }
  }

  // Combine for easier parsing
  let combined = textBlobs.join('\n').trim();
  if (!combined) return;

  // 1) Prefer META-wrapped JSON blocks: <META>{...}</META>
  const META_RE = /<META>\s*({[\s\S]*?})\s*<\/META>/g;
  combined = combined
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

  // 2) Fallback: scan lines for standalone JSON blocks (if no META markers)
  if (!/<META>/.test(combined)) {
    const lines = combined.split('\n');
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
    combined = kept.join('\n').trim();
  }

  // 3) Accumulate final human-facing reply (avoid duplicate trailing pushes)
  if (combined && replyParts[replyParts.length - 1] !== combined) {
    replyParts.push(combined);
  }

  // If META didn’t say anything, infer from punctuation
  if (isUserResponseNeeded === null) {
    const endsWithQuestion = /[?]\s*$/.test(combined);
    isUserResponseNeeded = endsWithQuestion;
  }

  return { parts: replyParts, agents, isUserResponseNeeded };
}

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

You MUST mention ONLY the items that exist in response of fetch_menu_sections under
each section OR you MUST mention ONLY the menu items that exist in the response 
from the latest fetch_menu_items tool result.

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

You MUST check if every requested food or drink item exists in the items of fetch_menu_items
before confirming anything.

If an item exists, you MUST ask the guest for a short confirmation BEFORE placing
the order with the order_food tool call.

DO NOT call order_food unless the guest has confirmed their order

If an item does NOT exist, you MUST politely say it is unavailable and suggest 
similar items.

You MUST NOT confirm or offer items that are not listed in the menu.

ORDER_FOOD TOOL CALL

For food or drink requests, you MUST ask for confirmation first.

You MUST call the order_food tool ONLY after he guest confirms.


Example confirmation pattern:
“You asked for two pumpkin soups and one black coffee. Shall I place the order?”

NOTES AND CART RULES

You MUST provide the itemId when constructing the cart with items. ItemIds are
available in menu_items under state, or get them with the fetch_menu_items tool call.

You MUST NOT make up random itemIds. You MUST fall back to item name only if you
cannot figure out the itemId.

You MUST send item notes ONLY if the guest explicitly gives them.

If the guest gives no notes, you MUST send blank notes.

You MUST include ONLY the items the guest clearly requested.

You MUST NOT add any extra cart items or extra instructions that the guest did 
not state.
`;

const MUSIC_PROMPT = `
MUSIC PLAYER RULES

If the guest asks to play music, you MUST NOT call any hotel service tools.

You MUST instruct the local app using a JSON metadata block with an "agents" 
array.

You MUST output the metadata on a single line as:
<META>{"agents": [{"type": "Music","parameters": [...] }]}</META>

INvOCATION FORMAT

You MUST provide specific song titles in the "parameters" array.

If the guest requests a specific song, you MUST provide 10–15 similar songs.

If the guest requests an artist or playlist (e.g., “play A. R. Rahman songs”), 
you MUST return 10–15 representative songs by that artist.

Example:
<META>{"agents": [{"type": "Music","parameters": ["Song 1","Song 2","Song 3"]}]}</META>

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
  if (!conversationState) {
    conversationState = {
      menu_items: [],
    };
  }

  const intentResp = await discoverIntents({ userText, messagesInConversation });
  const { tools, prompts } = getPromptAndToolsForIntents({ intents: intentResp.intents });

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
    ...messagesInConversation,
    { role: 'user', content: userText },
  ];

  const MAX_LOOPS = 6;
  let previousResponseId = null;

  async function step({ input, instructions }) {
    const args = { model: GPT_MODEL, tools };
    if (previousResponseId) args.previous_response_id = previousResponseId;
    if (!previousResponseId) args.input = baseInput;
    if (input) args.input = input;
    if (instructions) args.instructions = instructions;

    const resp = await OpenAIClient.responses.create(args);
    previousResponseId = resp.id;
    return resp;
  }

  let replyParts = [];
  let isUserResponseNeeded = false;
  let agents = [];

  // First turn
  let resp = await step({});

  for (let i = 0; i < MAX_LOOPS; i++) {
    // 0) Capture any assistant message(s) from this turn, even if tool calls exist
    const reply = collectReplyTexts(resp);
    if (reply) {
      isUserResponseNeeded = reply.isUserResponseNeeded;
      agents = [...agents, ...reply.agents];
      replyParts = [...replyParts, ...reply.parts];
    }

    // 1) Gather tool calls
    const toolCalls = (resp.output || []).filter((o) => o.type === 'function_call');

    // 2) If no more tool calls, we’re done (we already collected messages above)
    if (!toolCalls.length) break;

    // 3) Resolve all tool calls in parallel
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
        });

        if (tc.name === 'fetch_menu_items') {
          const existingItems = conversationState.menu_items || [];
          const existingItemsSet = new Set([...existingItems.map((i) => i.itemId)]);
          conversationState.menu_items = [
            ...existingItems,
            ...output.filter((i) => !existingItemsSet.has(i.itemId)),
          ];
        }

        return {
          type: 'function_call_output',
          call_id: tc.call_id,
          output: JSON.stringify(output ?? null),
        };
      })
    );

    // 4) Continue conversation
    resp = await step({
      input: toolResults,
      instructions:
        "Give TTS friendly responses without any characters that can't be conveyed in speech",
    });
  }

  const replyText = replyParts.join('\n\n'); // or " " if you prefer single-line TTS

  return {
    reply: replyText || 'Something went wrong, could you please try that again?',
    isUserResponseNeeded,
    agents,
    conversationState,
  };
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
