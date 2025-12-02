import { synthesizeSpeech } from '#services/TTS.service.js';
import { streamingTranscribe } from '#clients/STT.client.js';
import { handleConversation } from '#services/Conversation.service.js';
import { ulid } from 'ulid';
import { sendVoiceAgentTrialNotification } from '#services/Slack.service.js';
import { Language, VoiceForLanguage } from '#Constants/Language.constants.js';

const TRIAL_LIMIT_MS = 5 * 60 * 1000; // 5 minutes

// Map our internal language enum → Google STT v2 Recognizer names.
// Fill these env vars with your actual recognizer resource IDs, e.g.:
//   projects/<PROJECT>/locations/asia-south1/recognizers/roommitra-en-in

function getGreetingText(language) {
  switch (language) {
    case Language.English:
      return 'Hi, this is Room Mitra. I am your virtual assistant for the hotel. How can I help you today?';

    case Language.Kannada:
      return 'ಹಾಯ್, ಇದು ರೂಂ ಮಿತ್ರ. ನಾನು ನಿಮ್ಮ ಹೋಟೆಲ್‌ನ ವರ್ಚುವಲ್ ಸಹಾಯಕ. ಇಂದು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?';

    case Language.Hindi:
      return 'नमस्ते, यह रूम मित्रा है। मैं आपके होटल की वर्चुअल असिस्टेंट हूँ। आज मैं आपकी कैसे मदद कर सकती हूँ?';

    case Language.Telugu:
      return 'హాయ్, ఇది రూమ్ మిత్ర. నేను మీ హోటల్‌కు వర్చువల్ అసిస్టెంట్‌ని. ఈ రోజు మీకు ఎలా సహాయం చేయగలను?';

    case Language.Tamil:
      return 'ஹாய், இது ரூம் மித்ரா. நான் உங்கள் ஹோட்டலுக்கான மெய்நிகர் உதவியாளர். இன்று நான் எப்படி உதவலாம்?';

    case Language.Malayalam:
      return 'ഹൈ, ഇത് റൂം മിത്ര. ഞാൻ നിങ്ങളുടെ ഹോട്ടലിലെ വെർച്വൽ അസിസ്റ്റന്റ് ആണ്. ഇന്ന് ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കാം?';
  }

  return 'Hi, this is Room Mitra. I am your virtual assistant for the hotel. How can I help you today?';
}

async function generateAgentReply(userText, conversationId) {
  const text = (userText || '').trim();

  if (!text) {
    // We really shouldn’t get here anymore, but just in case:
    return 'How can I help you?';
  }

  const conversationData = {
    hotelId: process.env.DEMO_HOTEL_ID,
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

  const reply = await generateAgentReply(cleaned, ws.conversationId);
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
  ws.isMuted = false;

  const callStartedAt = Date.now();
  ws.callStartedAt = callStartedAt;

  const TRIAL_MESSAGE =
    'This was a trial call with Room Mitra and is limited to 5 minutes. I will end the call now. To continue, please request a full demo from our website.';

  // Set up a timer that ends the call after 5 minutes
  const trialTimer = setTimeout(async () => {
    if (!ws || ws.readyState !== ws.OPEN) {
      console.warn('[WS] Trial timer fired but socket is not open.');
      return;
    }

    console.log('[WS] Trial limit reached. Sending final TTS.');

    try {
      // 1) Send the text + audio fully
      await sendTTSReply(ws, { ssml: `<speak>${TRIAL_MESSAGE}</speak>`, message: TRIAL_MESSAGE });
    } catch (err) {
      console.error('[WS] Error sending trial TTS reply:', err);
    }

    // 2) Now signal call end and close socket (optionally with a slightly longer delay)
    endCall(ws, 4000, 'trial_ended', { delayMs: 2000 }); // 2s to let buffers flush
  }, TRIAL_LIMIT_MS);

  ws.trialTimer = trialTimer;

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

    const durationMs = Date.now() - callStartedAt;
    const reason = reasonBuf.toString();

    sendVoiceAgentTrialNotification(
      { name: user.name, email: user.sub },
      durationMs,
      reason,
      conversationId,
      ws.language
    );

    isClosing = true;
    // console.log('[WS] Client disconnected');
  });

  ws.on('error', (error) => {
    isClosing = true;
    console.error('[WS] WebSocket Error:', error);
  });
}
