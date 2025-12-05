import { synthesizeSpeech } from '#services/TTS.service.js';
import { streamingTranscribe } from '#clients/STT.client.js';
import { handleConversation } from '#services/Conversation.service.js';
import { ulid } from 'ulid';
import { sendVoiceAgentTrialNotification } from '#services/Slack.service.js';
import { Language, VoiceForLanguage } from '#Constants/Language.constants.js';
import { sendConversationEmail } from '#services/Email/Email.service.js';

const TRIAL_LIMIT_MINS = 5; // 5 minutes
const TRIAL_LIMIT_MS = TRIAL_LIMIT_MINS * 60 * 1000;

function getGreetingText(language) {
  switch (language) {
    case Language.English:
      return 'Hi, I am Vaani, your virtual assistant for the hotel. How can I help you today?';

    case Language.Kannada:
      return 'ಹಾಯ್, ನಾನು ವಾಣಿ, ನಿಮ್ಮ ಹೋಟೆಲ್‌ನ ವರ್ಚುವಲ್ ಸಹಾಯಕಳು. ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?';

    case Language.Hindi:
      return 'नमस्ते, मैं वाणी हूँ, आपके होटल की वर्चुअल असिस्टेंट। आज मैं आपकी कैसे मदद कर सकती हूँ?';

    case Language.Telugu:
      return 'హాయ్, నేను వాణి, మీ హోటల్‌కి వర్చువల్ అసిస్టెంట్‌ని. ఈ రోజు మీకు ఎలా సహాయం చేయగలను?';

    case Language.Tamil:
      return 'ஹாய், நான் வாணி, உங்கள் ஹோட்டலின் மெய்நிகர் உதவியாளர். இன்று நான் எப்படி உதவலாம்?';

    case Language.Malayalam:
      return 'ഹായ്, ഞാൻ വാണി, നിങ്ങളുടെ ഹോട്ടലിന്റെ വെർച്വൽ അസിസ്റ്റന്റാണ്. ഇന്ന് ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കാം?';

    default:
      return 'Hi, I am Vaani, your virtual assistant for the hotel. How can I help you today?';
  }
}
function getTrialMessage(language, minutes) {
  const baseEnglish = `This was a trial call and is limited to ${minutes} minutes. I will end the call now. To continue, please request a full demo from our website.`;

  switch (language) {
    case Language.English:
      return baseEnglish;

    case Language.Kannada:
      return `ಇದು ಟ್ರಯಲ್ ಕರೆ ಆಗಿತ್ತು ಮತ್ತು ಇದು ${minutes} ನಿಮಿಷಗಳಿಗೆ ಸೀಮಿತವಾಗಿದೆ. ನಾನು ಈಗ ಕರೆ ಮುಗಿಸುತ್ತೇನೆ. ಮುಂದುವರಿಸಲು, ದಯವಿಟ್ಟು ನಮ್ಮ ವೆಬ್‌ಸೈಟ್ ಮೂಲಕ ಸಂಪೂರ್ಣ ಡೆಮೋವನ್ನು ವಿನಂತಿಸಿ.`;

    case Language.Hindi:
      return `यह एक ट्रायल कॉल था और यह ${minutes} मिनट तक सीमित है। मैं अब कॉल समाप्त कर रही हूँ। आगे जारी रखने के लिए कृपया हमारी वेबसाइट से पूरा डेमो अनुरोध करें।`;

    case Language.Telugu:
      return `ఇది ఒక ట్రయల్ కాల్이며 ఇది ${minutes} నిమిషాలకు మాత్రమే పరిమితం. నేను ఇప్పుడు కాల్‌ను ముగిస్తున్నాను. కొనసాగించడానికి, దయచేసి మా వెబ్‌సైట్ ద్వారా పూర్తి డెమోను అభ్యర్థించండి.`;

    case Language.Tamil:
      return `இது ஒரு டிரயல் கால், மற்றும் இது ${minutes} நிமிடங்களுக்கு மட்டுமே வரையறுக்கப்பட்டுள்ளது. நான் இப்போது கால் முடிக்கிறேன். தொடர்ந்து பயன்படுத்த, எங்கள் இணையதளம் மூலம் முழு டெமோவை கேட்டுக்கொள்ளுங்கள்.`;

    case Language.Malayalam:
      return `ഇത് ഒരു ട്രയൽ കോൾ ആയിരുന്നു, ഇത് ${minutes} മിനിറ്റിലേക്ക് പരിമിതപ്പെടുത്തിയിരിക്കുന്നു. ഞാൻ ഇപ്പോൾ കോൾ അവസാനിപ്പിക്കുന്നു. തുടർ സേവനങ്ങൾക്ക്, ദയവായി ഞങ്ങളുടെ വെബ്സൈറ്റിൽ നിന്ന് ഒരു പൂർണ്ണ ഡെമോ അഭ്യർത്ഥിക്കുക.`;

    default:
      return baseEnglish;
  }
}

function getMaxCallDurationMessage(language) {
  const baseEnglish =
    'This call has reached the maximum allowed duration. I’ll end it here, but you’re welcome to start a new call anytime.';

  switch (language) {
    case Language.English:
      return baseEnglish;

    case Language.Kannada:
      return 'ಈ ಕರೆ ಅನುಮತಿಸಲಾದ ಗರಿಷ್ಠಾವಧಿಯನ್ನು ತಲುಪಿದೆ. ನಾನು ಇಲ್ಲಿ ಕರೆ ಮುಗಿಸುತ್ತೇನೆ, ಆದರೆ ನೀವು ಯಾವಾಗ ಬೇಕಾದರೂ ಹೊಸ ಕರೆ ಪ್ರಾರಂಭಿಸಬಹುದು.';

    case Language.Hindi:
      return 'यह कॉल अधिकतम अनुमत अवधि तक पहुँच गया है। मैं यहाँ कॉल समाप्त कर रही हूँ, लेकिन आप कभी भी एक नया कॉल शुरू कर सकते हैं।';

    case Language.Telugu:
      return 'ఈ కాల్ అనుమతించబడిన గరిష్ట వ్యవధిని చేరుకుంది. నేను ఇప్పుడు కాల్‌ను ముగిస్తాను, కానీ మీరు ఎప్పుడైనా కొత్త కాల్ ప్రారంభించవచ్చు.';

    case Language.Tamil:
      return 'இந்த கால் அனுமதிக்கப்பட்ட அதிகபட்ச நேரத்தை எட்டியுள்ளது. நான் இங்கே கால் முடிக்கிறேன், ஆனால் நீங்கள் எப்போது வேண்டுமானாலும் புதிய கால் தொடங்கலாம்.';

    case Language.Malayalam:
      return 'ഈ കോള് അനുവദിച്ച പരമാവധി ദൈർഘ്യത്തിലെത്തി. ഞാൻ ഇവിടെ കോള് അവസാനിപ്പിക്കുന്നു, എന്നാൽ നിങ്ങൾക്ക് ഏത് സമയത്തും പുതിയ കോള് ആരംഭിക്കാം.';

    default:
      return baseEnglish;
  }
}

async function generateAgentReply(userText, conversationId, hotelId) {
  const text = (userText || '').trim();

  if (!text) {
    // We really shouldn’t get here anymore, but just in case:
    return 'How can I help you?';
  }

  const conversationData = {
    hotelId,
    conversationId,
    userContent: text,
    isProspect: true,
  };

  return await handleConversation(conversationData);
}

// Send one text + TTS reply
// Supports rich contentBlocks alongside plain text.
async function sendTTSReply(ws, reply) {
  const payload = {
    type: 'reply_text',
    language: ws.language,
  };

  if (reply.message) {
    payload.text = reply.message;
  }

  if (Array.isArray(reply.contentBlocks) && reply.contentBlocks.length > 0) {
    payload.contentBlocks = reply.contentBlocks;
  }

  ws.send(JSON.stringify(payload));

  // If the client is muted, skip TTS and only send text/contentBlocks.
  if (ws.isMuted) {
    return;
  }

  const audioContent = await synthesizeSpeech(reply.ssml, ws.language);
  if (!audioContent || !audioContent.length) {
    console.error('[TTS] No audio bytes to send');
    ws.send(
      JSON.stringify({
        type: 'error',
        message: 'TTS failed or returned empty audio.',
      })
    );
    return;
  }

  ws.send(JSON.stringify({ type: 'audio_start', format: 'mp3' }));
  ws.send(audioContent, { binary: true });
  ws.send(JSON.stringify({ type: 'audio_end' }));
}

async function handleUserTextMessage(ws, text) {
  const cleaned = (text || '').trim();
  if (!cleaned) {
    return;
  }

  const reply = await generateAgentReply(cleaned, ws.conversationId, ws.hotelId);
  await sendTTSReply(ws, reply);

  if (reply.canEndCall) {
    endCall(ws, 1000, 'no_more_actions');
  }
}

function endCall(ws, code = 1000, reason = 'agent_completed', options = {}) {
  const { delayMs = 150 } = options;

  if (!ws || ws.readyState !== ws.OPEN) {
    console.warn('[WS] endCall called but socket is not open.');
    return;
  }

  // console.log('[WS] Ending call. Reason:', reason);

  // 1. Notify client that the agent is ending the call
  ws.send(
    JSON.stringify({
      type: 'call_end',
      reason,
    })
  );

  // 2. Small delay to allow message (and any remaining audio frames) to flush
  setTimeout(() => {
    try {
      ws.close(code, reason);
      // console.log('[WS] Socket closed with reason:', reason);
    } catch (err) {
      console.error('[WS] Failed to close socket:', err);
    }
  }, delayMs);
}

// Handle a full utterance (STT -> reply -> TTS)
async function processUtterance(ws, audioBufferRef, language) {
  const audioBuffer = audioBufferRef.current;

  // 1) Skip if the audio is too short (e.g. < 200 ms)
  // 16000 samples/sec * 2 bytes/sample ≈ 32000 bytes/sec
  const MIN_AUDIO_BYTES = 32000 * 0.2; // ~0.2 seconds
  if (!audioBuffer || audioBuffer.length < MIN_AUDIO_BYTES) {
    // console.log(
    //   '[WS] END_UTTERANCE: audio too short (',
    //   audioBuffer?.length || 0,
    //   'bytes). Skipping STT.'
    // );
    audioBufferRef.current = Buffer.alloc(0);
    return;
  }

  // Clear buffer for next utterance
  audioBufferRef.current = Buffer.alloc(0);

  // console.log('[WS] Processing utterance. Audio bytes:', audioBuffer.length);

  const recognizerName = VoiceForLanguage[language].recognizer;
  if (!recognizerName) {
    console.error('[STT] No recognizer configured for language:', language);
    ws.send(
      JSON.stringify({
        type: 'error',
        message: 'Transcription failed due to missing recognizer configuration.',
      })
    );
    return;
  }

  let finalTranscript = '';
  let lastPartial = '';

  try {
    // Stream this utterance buffer to Google STT v2 and emit partial + final results.
    await streamingTranscribe({
      recognizerName,
      audioBuffer,
      onPartial: (partial) => {
        const cleanedPartial = (partial || '').trim();
        if (!cleanedPartial) return;
        lastPartial = cleanedPartial;

        // Stream partial text to the client for live UI updates
        ws.send(
          JSON.stringify({
            type: 'transcript_partial',
            text: cleanedPartial,
          })
        );
      },
      onFinal: (full) => {
        finalTranscript = (full || '').trim();
      },
    });
  } catch (err) {
    console.error('[STT] Streaming transcription failed:', err);
    ws.send(
      JSON.stringify({
        type: 'error',
        message: 'Transcription failed due to server error. Check server logs for details.',
      })
    );
    return;
  }

  // If for some reason we never got an explicit final result, fall back
  // to the last partial.
  const cleaned = (finalTranscript || lastPartial || '').trim();

  // 2) If STT returned nothing or almost nothing, don't reply.
  //    We also skip the "sorry, I couldn’t hear that" in this case.
  const MIN_TRANSCRIPT_CHARS = 5;
  if (!cleaned || cleaned.length < MIN_TRANSCRIPT_CHARS) {
    // console.log(
    //   '[WS] Empty/short transcription, skipping reply. Transcript:',
    //   JSON.stringify(cleaned)
    // );

    // Optional: you can send a transcript back if you want to debug, but
    // the client ignores empty text anyway.
    ws.send(
      JSON.stringify({
        type: 'transcript',
        text: cleaned,
      })
    );

    return;
  }

  // 3) Send transcript text (user side)
  ws.send(
    JSON.stringify({
      type: 'transcript',
      text: cleaned,
    })
  );

  // 4) Handle the recognized text as a user message
  await handleUserTextMessage(ws, cleaned);
}

// --- Main connection handler ---

export function connection(ws, request) {
  const user = request.user;

  if (!user) {
    // Should not happen if upgrade auth is correct, but just in case:
    endCall(ws, 4003, 'unauthorized');
    return;
  }

  ws.language = user.language;
  ws.hotelId = user.hotelId;
  ws.isMuted = false;

  const callStartedAt = Date.now();
  ws.callStartedAt = callStartedAt;

  const trialMessage = getTrialMessage(ws.language, TRIAL_LIMIT_MINS);
  const maxCallDurationMessage = getMaxCallDurationMessage(ws.language);

  if (ws.hotelId === process.env.DEMO_HOTEL_ID) {
    // Set up a timer that ends the call after TRIAL_LIMIT_MS
    const trialTimer = setTimeout(async () => {
      if (!ws || ws.readyState !== ws.OPEN) {
        console.warn('[WS] Trial timer fired but socket is not open.');
        return;
      }

      console.log('[WS] Trial limit reached. Sending final TTS.');

      try {
        // 1) Send the text + audio fully
        await sendTTSReply(ws, { ssml: `<speak>${trialMessage}</speak>`, message: trialMessage });
      } catch (err) {
        console.error('[WS] Error sending trial TTS reply:', err);
      }

      // 2) Now signal call end and close socket (optionally with a slightly longer delay)
      endCall(ws, 4000, 'trial_ended', { delayMs: 2000 }); // 2s to let buffers flush
    }, TRIAL_LIMIT_MS);

    ws.trialTimer = trialTimer;
  }

  // Set up a timer that ends the call when the token expires
  const maxCallDurationMs = (user.exp - Math.floor(Date.now() / 1000)) * 1000;
  const maxCallDurationTimer = setTimeout(async () => {
    if (!ws || ws.readyState !== ws.OPEN) {
      console.warn('[WS] Max Call Duration timer fired but socket is not open.');
      return;
    }

    console.log('[WS] Max Call Duration limit reached. Sending final TTS.');

    try {
      // 1) Send the text + audio fully
      await sendTTSReply(ws, {
        ssml: `<speak>${maxCallDurationMessage}</speak>`,
        message: maxCallDurationMessage,
      });
    } catch (err) {
      console.error('[WS] Error sending max call duration TTS reply:', err);
    }

    // 2) Now signal call end and close socket (optionally with a slightly longer delay)
    endCall(ws, 4000, 'max_call_duration', { delayMs: 2000 }); // 2s to let buffers flush
  }, maxCallDurationMs);

  ws.maxCallDurationTimer = maxCallDurationTimer;

  const conversationId = ulid();
  ws.conversationId = conversationId;

  // Use a wrapper object so we can mutate .current from async function safely
  const audioBufferRef = { current: Buffer.alloc(0) };
  let isClosing = false;

  ws.on('message', async function incoming(message, isBinary) {
    // 1) Binary = PCM16 audio chunks
    if (isBinary) {
      const messageBuffer = Buffer.isBuffer(message) ? message : Buffer.from(message);

      audioBufferRef.current = Buffer.concat([audioBufferRef.current, messageBuffer]);
      // console.log('[WS] Audio buffer size:', audioBufferRef.current.length);
      return;
    }

    // 2) Text = control messages (START_CALL, END_UTTERANCE, etc.)
    const text = typeof message === 'string' ? message : message.toString('utf8');

    let command;
    try {
      command = JSON.parse(text);
    } catch (e) {
      console.warn('[WS] Non-JSON text frame received, ignoring:', text);
      return;
    }

    // Ignore commands if socket is closing
    if (isClosing) return;

    switch (command.type) {
      case 'START_CALL': {
        // console.log('[WS] START_CALL received');

        const greetingText = getGreetingText(ws.language);
        await sendTTSReply(ws, { ssml: `<speak>${greetingText}</speak>`, message: greetingText });
        break;
      }

      // New continuous listening name
      case 'END_UTTERANCE': {
        // console.log('[WS] END_UTTERANCE received');
        await processUtterance(ws, audioBufferRef, ws.language);
        break;
      }

      case 'USER_TEXT': {
        // Text message sent directly from client, skip STT entirely
        await handleUserTextMessage(ws, command.text || '');
        break;
      }

      case 'SET_MUTE': {
        ws.isMuted = !!command.muted;
        break;
      }

      case 'END_CALL': {
        console.log('[WS] END_CALL received');

        const code = 1000;
        const reason = 'user_ended_conversation';
        ws.close(code, reason);
        break;
      }

      case 'PING': {
        ws.send(JSON.stringify({ type: 'PONG' }));
        break;
      }

      default: {
        console.warn('[WS] Unknown command type:', command.type);
      }
    }
  });

  ws.on('close', (_code, reasonBuf) => {
    // Always clear the timer so it does not fire after the socket is already closed
    if (ws.trialTimer) {
      clearTimeout(ws.trialTimer);
    }

    if (ws.maxCallDurationTimer) {
      clearTimeout(ws.maxCallDurationTimer);
    }

    const durationMs = Date.now() - callStartedAt;
    const reason = reasonBuf.toString();

    sendVoiceAgentTrialNotification(
      { name: user.name, email: user.sub },
      durationMs,
      reason,
      conversationId,
      ws.language
    );

    sendConversationEmail({
      to: ['chai@roommitra.com', 'adithya@roommitra.com'],
      guest: {
        name: user.name,
        email: user.sub,
      },
      conversationId,
      hotelId: ws.hotelId,
      startedAt: ws.callStartedAt,
    });

    isClosing = true;
    // console.log('[WS] Client disconnected');
  });

  ws.on('error', (error) => {
    isClosing = true;
    console.error('[WS] WebSocket Error:', error);
  });
}
