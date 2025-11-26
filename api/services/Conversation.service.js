import * as messageRepo from '#repositories/Message.repository.js';
import * as conversationRepo from '#repositories/Conversation.repository.js';
import * as chatGPTService from '#services/ChatGPT/ChatGPT.service.js';
import { ulid } from 'ulid';
import { toIsoString } from '#common/timestamp.helper.js';

function newMessage({ role, content, ssml, conversationId, ...props }) {
  return {
    role,
    content,
    ssml,
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
  isProspect,
}) {
  let conversation = null;
  let conversationState = null;
  let messagesInConversation = [];

  if (conversationId) {
    // For existing conversations, retrieve the past messages
    const all = await messageRepo.queryAllForConversation(conversationId, {
      consistentRead: true,
    });

    const messages = all.filter((i) => i.sk !== 'STATE');
    conversationState = all.filter((i) => i.sk === 'STATE')?.[0];
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
      isProspect,
    };
  }

  if (!conversationState) {
    conversationState = {
      pk: `CONVERSATION#${conversationId}`,
      sk: 'STATE',
      active_pk: `CONVERSATION#${conversationId}`,
      active_sk: 'STATE',
      entityType: 'CONVERSATION_STATE',
      conversationId,
      createdAt: toIsoString(),
      vegOnly: false,
      veganOnly: false,
      glutenFree: false,
      excludeAllergens: [],
      hotel_requests: [],
      order_requests: [],
      menu_items: [],
      room_availability: [],
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
    conversationState,
    isProspect,
  });

  const {
    reply,
    isUserResponseNeeded,
    canEndCall,
    agents,
    conversationState: updatedConversationState,
  } = chatGPTResponse;

  // All new messages that have to be saved
  const newMessages = [
    newUserMessage,
    newMessage({
      role: 'assistant',
      content: stripSSML(reply),
      ssml: reply,
      conversationId,
    }),
  ];
  // Now we save everything in the db
  await conversationRepo.saveConversationEntities(
    conversation,
    newMessages,
    updatedConversationState
  );

  const response = {
    conversationId,
    message: stripSSML(reply),
    ssml: reply,
    isConversationOpen: isUserResponseNeeded,
    canEndCall,
    agents,
    contentBlocks: [],
    // contentBlocks: [
    //   {
    //     type: 'text',
    //     text: stripSSML(reply),
    //   },
    //   {
    //     type: 'image_list',
    //     items: [
    //       {
    //         url: 'https://roommitra-assets-bucket.s3.ap-south-1.amazonaws.com/01K8YNZK107SWYMN3XSCHTFRFW/AMENITY/01K97101227EDW4GVME6AR7KGN.jpeg',
    //         caption: 'UrMedz Millenium',
    //         alt: 'UrMedz Millenium',
    //       },
    //     ],
    //   },
    // ],
  };

  return response;
}

export function stripSSML(text = '') {
  if (!text) return '';

  return (
    text
      // unwrap <say-as> tags but keep the inner digits
      .replace(/<say-as[^>]*>(.*?)<\/say-as>/gi, '$1')

      // remove <speak> if present
      .replace(/<\/?speak>/gi, '')

      // collapse whitespace
      .replace(/\s+/g, ' ')

      .trim()
  );
}
