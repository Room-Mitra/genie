import { TTSClient } from '#clients/TTS.client.js';
import { STTClient } from '#clients/STT.client.js';

// --- Configuration ---

const AUDIO_CONFIG = {
  encoding: 'LINEAR16',
  sampleRateHertz: 16000,
  languageCode: 'en-US',
};

const TTS_VOICE = {
  languageCode: 'en-US',
  name: 'en-US-Standard-C',
};

// --- Helpers ---

async function transcribeAudio(audioBuffer) {
  try {
    if (!audioBuffer || !audioBuffer.length) {
      console.warn('[STT] Empty audioBuffer passed to transcribeAudio');
      return '';
    }

    const audioBytes = audioBuffer.toString('base64');

    const request = {
      audio: { content: audioBytes },
      config: AUDIO_CONFIG,
    };

    const [response] = await STTClient.recognize(request);

    if (!response.results || response.results.length === 0) {
      console.warn('[STT] No transcription results from STT service');
      return '';
    }

    const transcription = response.results
      .map((result) => result.alternatives?.[0]?.transcript || '')
      .join(' ')
      .trim();

    console.log('[STT] Final transcription:', transcription);
    return transcription;
  } catch (err) {
    console.error('[STT] Error during transcription:', err);
    return 'Transcription failed.';
  }
}

function generateAgentReply(userText) {
  if (!userText || !userText.trim()) {
    return "I'm sorry, I couldn't quite hear that. Could you please repeat that?";
  }

  if (userText.toLowerCase().includes('weather')) {
    return 'The current weather is sunny with a high of 75 degrees Fahrenheit. Is there anything else I can help you with?';
  }

  return `Thank you for saying, "${userText}". I am now processing your request. Please wait one moment.`;
}

async function synthesizeSpeech(text) {
  const request = {
    input: { text },
    voice: TTS_VOICE,
    audioConfig: { audioEncoding: 'MP3' },
  };

  try {
    const [response] = await TTSClient.synthesizeSpeech(request);
    const audioBase64 = response.audioContent;

    if (!audioBase64) {
      console.warn('[TTS] Empty audioContent returned from TTS');
      return Buffer.alloc(0);
    }

    const audioBuffer = Buffer.from(audioBase64, 'base64');
    console.log('[TTS] Audio buffer size:', audioBuffer.length);
    return audioBuffer;
  } catch (error) {
    console.error('[TTS] Error:', error);
    return Buffer.alloc(0);
  }
}

// Send one text + TTS reply
async function sendTTSReply(ws, replyText) {
  ws.send(JSON.stringify({ type: 'reply_text', text: replyText }));

  const audioContent = await synthesizeSpeech(replyText);
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

// Handle a full utterance (STT -> reply -> TTS)
async function processUtterance(ws, audioBufferRef) {
  const audioBuffer = audioBufferRef.current;

  if (!audioBuffer || !audioBuffer.length) {
    console.warn('[WS] END_UTTERANCE received but audioBuffer is empty');
    ws.send(
      JSON.stringify({
        type: 'error',
        message: 'No audio data received for this utterance.',
      })
    );
    return;
  }

  // Clear buffer for next utterance
  audioBufferRef.current = Buffer.alloc(0);

  console.log('[WS] Processing utterance. Audio bytes:', audioBuffer.length);

  const userText = await transcribeAudio(audioBuffer);

  if (userText === 'Transcription failed.') {
    ws.send(
      JSON.stringify({
        type: 'error',
        message: 'Transcription failed due to server error. Check server logs for details.',
      })
    );
    return;
  }

  // Send transcript text (user side)
  ws.send(
    JSON.stringify({
      type: 'transcript',
      text: userText,
    })
  );

  const replyText = generateAgentReply(userText);
  await sendTTSReply(ws, replyText);
}

// --- Main connection handler ---

export function connection(ws) {
  console.log('[WS] Client connected');

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
        console.log('[WS] START_CALL received');

        const greetingText =
          'Hi, this is Room Mitra. I am your virtual assistant for the hotel. How can I help you today?';

        await sendTTSReply(ws, greetingText);
        break;
      }

      // New continuous listening name
      case 'END_UTTERANCE': {
        console.log('[WS] END_UTTERANCE / STOP_RECORDING received');
        await processUtterance(ws, audioBufferRef);
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

  ws.on('close', () => {
    isClosing = true;
    console.log('[WS] Client disconnected');
  });

  ws.on('error', (error) => {
    isClosing = true;
    console.error('[WS] WebSocket Error:', error);
  });
}
