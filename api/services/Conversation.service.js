import * as messageRepo from '#repositories/Message.repository.js';
import * as hotelRepo from '#repositories/Hotel.repository.js';
import * as requestRepo from '#repositories/Request.repository.js';
import * as conversationRepo from '#repositories/Conversation.repository.js';
import * as chatGPTService from '#services/ChatGPT/ChatGPT.service.js';
import * as requestService from '#services/Request.service.js';
import { requestResponse } from '#presenters/request.js';
import { callChatGptApi, parseGptResponse } from '#libs/ChatGptOld.js';
import { ulid } from 'ulid';

function newMessage({ role, content, conversationId, ...props }) {
  return {
    role,
    content,
    conversationId,
    entityType: 'MESSAGE',
    messageId: ulid(),
    ...props,
  };
}

export async function handleConversation({
  hotelId,
  roomId,
  deviceId,
  bookingId,
  guestUserId,
  conversationId,
  userContent,
}) {
  let conversation = null;
  let messagesInConversation = [];

  if (conversationId) {
    // For existing conversations, retrieve the past messages
    const messages = await messageRepo.getMessages({ conversationId });
    messagesInConversation = messages.map((m) => ({ role: m.role, content: m.content }));
  } else {
    // Create a new conversation
    conversationId = ulid();
    conversation = {
      hotelId,
      roomId,
      conversationId,
      entityType: 'CONVERSATION',
      bookingId: bookingId,
      guestUserId,
      deviceId: deviceId,
      channel: 'android',
    };
  }

  const newUserMessage = newMessage({ role: 'user', content: userContent, conversationId });

  const chatGPTResponse = await chatGPTService.askChatGpt({
    userText: userContent,
    messagesInConversation,
    hotelId,
    roomId,
    deviceId,
    bookingId,
    conversationId,
    guestUserId,
  });

  // All new messages that have to be saved
  const newMessages = [
    newUserMessage,
    newMessage({ role: 'assistant', content: chatGPTResponse.reply, conversationId }),
  ];
  // Now we save everything in the db
  await conversationRepo.saveConversationEntities(conversation, newMessages);

  const response = {
    conversationId,
    message: chatGPTResponse.reply,
    // isConversationOpen: parsed.isUserResponseNeeded,
    // agents: parsed.agents,
    // requests: savedRequests.map(requestResponse),
  };

  return response;
}

export async function handleConversation2({
  hotelId,
  roomId,
  deviceId,
  bookingId,
  guestUserId,
  conversationId,
  userContent,
}) {
  let conversation = null;
  let messagesInConversation = [];

  if (conversationId) {
    // For existing conversations, retrieve the past messages
    const messages = await messageRepo.getMessages({ conversationId });
    messagesInConversation = messages.map((m) => ({ role: m.role, content: m.content }));
  } else {
    // Create a new conversation
    conversationId = ulid();
    conversation = {
      hotelId,
      roomId,
      conversationId,
      entityType: 'CONVERSATION',
      bookingId: bookingId,
      guestUserId,
      deviceId: deviceId,
      channel: 'android',
    };
  }

  const newUserMessage = newMessage({ role: 'user', content: userContent, conversationId });

  // Retreive hotel info and metas to be able to answer hotel related questions
  const hotel = await hotelRepo.queryLatestHotelById(hotelId);
  const hotelMetas = await hotelRepo.queryHotelMeta({ hotelId });
  const previousRequests = await requestRepo.queryRequestsForBooking({ bookingId });

  const amenities = hotelMetas.filter((m) => m.entityType === 'AMENITY');
  const concierge = hotelMetas.filter((m) => m.entityType === 'CONCIERGE');
  const restaurantMenu = hotelMetas.filter((m) => m.entityType === 'MENU');

  // The first prompt that has instructions to ChatGPT
  const hotelPrompt = chatGPTService.getHotelPrompt({
    hotel,
    amenities,
    concierge,
    restaurantMenu: restaurantMenu.contents,
    previousRequests,
  });

  // Prompt + previous messages + new user message
  const chatGPTMessages = [hotelPrompt, ...messagesInConversation, newUserMessage];

  const gptResponse = callChatGptApi(chatGPTMessages);
  if (gptResponse.statusCode !== 200) {
    const gptText = JSON.parse(gptResponse.getBody('utf8'));
    console.error('Failed GPT call:', gptResponse.statusCode, gptText);
    throw new Error(`Failed GPT call: ${gptResponse.statusCode}, ${gptText}`);
  }

  const { parsed } = parseGptResponse(gptResponse);

  // All new messages that have to be saved
  const newMessages = [
    newUserMessage,
    newMessage({ role: 'assistant', content: parsed.speech, conversationId, ...parsed }),
  ];

  // All new requests that have to be created
  const newRequests = [];
  parsed.requestDetails.forEach((rd) => {
    if (rd.hasUserConfirmedOrder) {
      newRequests.push({
        hotelId,
        roomId,
        deviceId,
        bookingId,
        department: rd.department,
        requestType: rd.requestType,
        conversationId,
        description: rd.shortDescription,
        guestUserId,
      });
    }
  });

  // Now we save everything in the db
  await conversationRepo.saveConversationEntities(conversation, newMessages);

  const savedRequests = await Promise.all(newRequests.map((r) => requestService.createRequest(r)));

  const response = {
    conversationId,
    message: parsed.speech,
    isConversationOpen: parsed.isUserResponseNeeded,
    agents: parsed.agents,
    requests: savedRequests.map(requestResponse),
  };

  return response;
}
