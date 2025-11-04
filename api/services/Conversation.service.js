import * as messageRepo from '#repositories/Message.repository.js';
import * as conversationRepo from '#repositories/Conversation.repository.js';
import * as chatGPTService from '#services/ChatGPT/ChatGPT.service.js';
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
    isConversationOpen: chatGPTResponse.isUserResponseNeeded,
    agents: chatGPTResponse.agents,
    // requests: savedRequests.map(requestResponse),
  };

  return response;
}
