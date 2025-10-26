import { getHotelPrompts } from '#repositories/Utterance.repository.js';
import SessionManager from '#libs/SessionManager.js';
import { callChatGptApi, parseGptResponse } from '#libs/ChatGpt.js';
import { registerIntent } from '#services/Intent.service.js';
import { registerDevice } from '#services/Device.service.js';

const ERROR_RESPONSE = {
  speech: 'Sorry, something went wrong. Please try again later',
  isSessionOpen: false,
};

export const onUtterance = async (userQuery, hotelId, deviceId, sessionId) => {
  const session = SessionManager.getSession(sessionId);
  SessionManager.addToSessionHistory(sessionId, 'user', userQuery);

  const messages = await buildPrompt(hotelId, session.history);
  const gptResponse = callChatGptApi(messages);
  if (gptResponse.statusCode !== 200) {
    console.error('Failed GPT call:', gptResponse.statusCode);
    const gptText = JSON.parse(gptResponse.getBody('utf8'));
    console.error('Error Text ::', gptText);
    return ERROR_RESPONSE;
  }
  const { raw, parsed } = parseGptResponse(gptResponse);
  SessionManager.addToSessionHistory(sessionId, 'assistant', raw);

  registerRequests(session, deviceId, parsed.requestDetails || []);
  //TODO :: Handle Error + Generic Error response
  return {
    speech: parsed.speech,
    isSessionOpen: parsed.isUserResponseNeeded,
    agents: parsed.agents,
  };
};

export const registerRequests = (session, deviceId, requestDetails) => {
  requestDetails.forEach((r) => {
    const { hasUserConfirmedOrder, department, requestType, shortDescription } = r;
    const intent = {
      deviceId,

      intentType: department,
      intentName: requestType,
      notes: shortDescription,

      conversationLog: session,

      daysSinceEpoch: Math.floor(Date.now() / (24 * 60 * 60 * 1000)), //PK
      requestedTime: Date.now(),
      inProgressTime: null,
      completedTime: null,
    };
    if (
      department.toLocaleLowerCase().includes('Restaurant'.toLocaleLowerCase()) ||
      department.toLocaleLowerCase().includes('Room Service'.toLocaleLowerCase()) ||
      department.toLocaleLowerCase().includes('Concierge'.toLocaleLowerCase())
    ) {
      hasUserConfirmedOrder && registerIntent(intent);
    } else {
      registerIntent(intent);
    }
  });
};

const buildPrompt = async (hotelId, history) => {
  return [...(await getHotelPrompts(hotelId)), ...history];
};

/** this function returns true if the user utterance was related to an admisnitrative task, else returns false.
 * if the task is an administrative action, it also
 */
export const handleAdministrativeUtterances = ({
  userQuery,
  // _sessionId,
  deviceId,
  hotelId = 'Room Mitra',
}) => {
  // CASE REGISTER THIS DEVICE
  const phrase = 'register this device with room';
  if (userQuery.toLocaleLowerCase().includes(phrase)) {
    const roomId = userQuery.split(phrase)[1].trim();
    const deviceDetails = {
      roomId,
      deviceId,
      hotelId,
      registeredAtUTC: new Date().toISOString(),
    };
    console.info('Attempting to register device with details : ', deviceDetails);
    registerDevice(deviceDetails);
    return true;
  }

  return false;
};
