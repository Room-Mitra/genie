import OpenAIClient from '#clients/OpenAI.client.js';
import { queryHotelMeta } from '#repositories/Hotel.repository.js';
import { getBookingById } from '#services/Booking.service.js';
import { getHotelById } from '#services/Hotel.service.js';
import { handleFetchMenu } from '#services/Menu.service.js';
import { createRequest, listRequestsByBooking } from '#services/Request.service.js';
import { summarizeRequests } from './summarizers/request.summarizer.js';
import { create_hotel_requests } from './tools/create_hotel_requests.tool.js';
import { fetch_menu } from './tools/fetch_menu.tool.js';
import { get_amenities } from './tools/get_amenities.tool.js';
import { get_booking_details } from './tools/get_booking_details.tool.js';
import { get_concierge_services } from './tools/get_concierge_services.tool.js';
import { get_hotel_details } from './tools/get_hotel_details.tool.js';
import { get_previous_requests } from './tools/get_previous_requests.tool.js';

const tools = [
  fetch_menu,
  get_amenities,
  get_booking_details,
  get_concierge_services,
  get_hotel_details,
  get_previous_requests,
  create_hotel_requests,
];

const system = `
  You are Room Mitra, an intelligent hotel in-room guest assistant that interprets guest request.
  When a guest message includes multiple intents, identify and handle each appropriately:
  If any part of the message requires an action via a tool (e.g., house_keeping, facilities, room_service), 
  call the matching tool with clear arguments.
  For other parts that need guest confirmation (e.g., ordering food or drinks), respond naturally 
  with a short confirmation question before placing the order.

  Call tools only when needed.
  
  Keep replies conversational and TTS-friendly (avoid brackets, acronyms, 
  non-conversational punctuation or meta-text in the reply). If the user 
  asks something unrelated to hotel services, give a very short answer and do not 
  ask follow-up questions unless explicitly needed.

  Only mention menu categories that actually exist for this hotel. 
  Never ask about “mains, snacks, desserts, or drinks” unless they are present 
  in the menu sections returned by tools.
  If only one section exists (e.g., Soups), say so and proceed with that.

  If a guest asks for a dish not on the menu, politely inform the guest that 
  the dish is not available and suggest a similar dish from the menu. If 
  no similar dish exists on the menu, let the guest know and do nothing.

  Before confirming any food or drink order, always check if the requested items 
  exist in the provided menu data.
  If an item is found on the menu, confirm it politely with the guest before 
  placing the order.
  If an item is NOT on the menu, inform the guest that it’s currently unavailable 
  and suggest similar available items instead.
  Never confirm or offer to place an order for items that are not listed in the menu.

  For Room Service orders, when the user requests food, ask the user to confirm the order 
  before making the tool call to create a hotel request for room service. 
  For example, "You asked for two Pumpkin Soups and a black coffee. Shall I place 
  the order?". Only when the guest confirms, make the tool call to create the
  hotel request for room service.

  Only send the item notes as specified by the guest. Do not include anything and 
  proceed with blank item notes if the guest hasn't specified anything. Only send
  cart or order mentioned by the guest. Do not include any order or cart instrutions 
  if the guest hasn't specified anything.

  Always be polite, concise, and TTS-friendly.

  After every assistant message, always include a small JSON metadata block with a 
  boolean field "isUserResponseNeeded" indicating whether the assistant is expecting 
  a reply or confirmation from the guest. Use this logic:
  - If the assistant has asked a question, offered a choice, or is waiting for 
    confirmation → "isUserResponseNeeded": true
  - Otherwise → "isUserResponseNeeded": false
    Output this metadata block immediately after the message in JSON format, 
    clearly separated, like: {"isUserResponseNeeded": true} 
  - After the assistant’s message, output a single line in 
    the form <META>{...}</META> that contains JSON. Do not include anything else on that line.
    For example: <META>{"isUserResponseNeeded": true}</META>


  The app has a music player that must be invoked with a specific song list. When the 
  guest asks to play music, do NOT create a hotel service request or call any tools, 
  instead include a small JSON metadata block with array field "agents" that instructs 
  the local app to play music. After the assistant’s message, output a single line in 
  the form <META>{...}</META> that contains JSON. Do not include anything else on that line.
  Format for music invocation:
  <META>{"agents": [{"type": "Music","parameters": ["Song 1", "Song 2", "Song 3"]}]}</META>
  
  Provide specific song titles (not vague phrases) in the parameters array. If the guest 
  asks for a specific track by name, include 10 - 15 song suggestions similar to that
  track. If the guest asks for an artist or playlist (e.g., "play A. R. Rahman songs"), 
  return a short 10 - 15 suggested list of representative song titles by that artist 
  in parameters. If the guest says "stop" or "stop the music", return:
  <META>{"agents": [{"type": "Music","parameters": []}]}</META>

  Music agent actions are app-internal and should not invoke any tools. When a music 
  request is made (including artist, playlist, or specific song requests), do not end 
  your reply with a question. "isUserResponseNeeded" should be false in these cases.
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
    case 'fetch_menu':
      return await handleFetchMenu(args);

    case 'get_amenities':
      return await queryHotelMeta({ hotelId, entityType: 'AMENITY' });

    case 'get_booking_details': {
      return await getBookingById({ hotelId, bookingId });
    }

    case 'get_concierge_services':
      return await queryHotelMeta({ hotelId, entityType: 'CONCIERGE' });

    case 'get_hotel_details':
      return await getHotelById(hotelId);

    case 'get_previous_requests':
      return await listRequestsByBooking({ bookingId: bookingId });

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

    case 'music_control':
      return 'music';
  }
};

function collectReplyTexts(resp) {
  if (!resp?.output) return;

  let isUserResponseNeeded = false;
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

  return { parts: replyParts, agents, isUserResponseNeeded };
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
}) {
  const baseInput = [
    { role: 'system', content: system },
    ...messagesInConversation,
    { role: 'user', content: userText },
  ];

  const MAX_LOOPS = 6;
  let previousResponseId = null;

  async function step({ input, instructions }) {
    const args = { model: 'gpt-5-mini', tools };
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
