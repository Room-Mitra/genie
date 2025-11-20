import { TTSClient } from '#clients/TTS.client.js';
import { STTClient } from '#clients/STT.client.js';
import fs from 'node:fs';
import path from 'node:path';

// --- Configuration Constants ---
const AUDIO_CONFIG = {
  encoding: 'LINEAR16', // Raw 16-bit PCM (WAV) audio is common for client-side recording
  sampleRateHertz: 16000, // Important: Must match the client's audio capture rate
  languageCode: 'en-US',
  // You can tweak these if you want:
  // enableAutomaticPunctuation: true,
  // model: 'default',
};

const TTS_VOICE = {
  languageCode: 'en-US',
  name: 'en-US-Standard-C', // Use a standard or WaveNet voice
};

// --- Core Logic ---

function analyzeBuffer(buffer) {
  let min = 32767;
  let max = -32768;

  for (let i = 0; i < buffer.length; i += 2) {
    const sample = buffer.readInt16LE(i); // interpret as signed 16-bit
    if (sample < min) min = sample;
    if (sample > max) max = sample;
  }

  console.log('[DEBUG] Audio sample range:', { min, max });
}

/**
 * Step 1: Speech-to-Text (STT)
 * @param {Buffer} audioContent The audio data buffer.
 * @returns {Promise<string>} The transcribed text.
 */

async function transcribeAudio(audioBuffer) {
  try {
    if (!audioBuffer || !audioBuffer.length) {
      console.warn('[STT] Empty audioBuffer passed to transcribeAudio');
      return '';
    }

    console.log('[STT] Starting transcription. Buffer length:', audioBuffer.length);

    const audioBytes = audioBuffer.toString('base64');

    const request = {
      audio: {
        content: audioBytes,
      },
      config: AUDIO_CONFIG,
    };

    const [response] = await STTClient.recognize(request);

    console.log('[STT] Raw STT response:', JSON.stringify(response, null, 2));

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

export function connection(ws) {
  console.log('Client connected via WebSocket');

  let audioBuffer = Buffer.alloc(0);

  ws.on('message', async function incoming(message, isBinary) {
    console.log('[WS] Incoming message', {
      isBinary,
      typeofMessage: typeof message,
      length: message?.length,
    });

    // 1. BINARY = audio chunks
    if (isBinary) {
      const messageBuffer = Buffer.isBuffer(message) ? message : Buffer.from(message);

      audioBuffer = Buffer.concat([audioBuffer, messageBuffer]);
      // Optional: log current buffer size
      // console.log('[WS] Audio buffer size:', audioBuffer.length);
      return;
    }

    // 2. TEXT = JSON control messages (STOP_RECORDING, etc.)
    // ws may still give you a Buffer for text frames – normalize to string
    const text = typeof message === 'string' ? message : message.toString('utf8');

    try {
      const command = JSON.parse(text);
      console.log('[WS] Parsed command:', command);

      if (command.type === 'STOP_RECORDING') {
        console.log('[WS] STOP_RECORDING received. Audio size:', audioBuffer.length);
        analyzeBuffer(audioBuffer);

        console.log('[WS] STOP_RECORDING received. Saving raw audio debug file...');

        const filename = path.join(`debug-audio-${Date.now()}.raw`);
        fs.writeFileSync(filename, audioBuffer);

        console.log('[WS] Saved audio to', filename);

        if (audioBuffer.length === 0) {
          console.warn('[WS] STOP_RECORDING received but audioBuffer is empty');
          ws.send(
            JSON.stringify({
              type: 'error',
              message: 'No audio data received.',
            })
          );
          return;
        }

        console.log(
          `[DEBUG] Received STOP_RECORDING. Audio length: ${audioBuffer.length} bytes. Starting STT...`
        );

        // ----- PHASE 1: STT -----
        const userText = await transcribeAudio(audioBuffer);

        if (userText === 'Transcription failed.') {
          ws.send(
            JSON.stringify({
              type: 'error',
              message: 'Transcription failed due to server error. Check server logs for details.',
            })
          );
          // Clear audio so next turn starts fresh
          audioBuffer = Buffer.alloc(0);
          return;
        }

        ws.send(
          JSON.stringify({
            type: 'transcript',
            text: userText,
          })
        );

        // Clear audio buffer for the next recording
        audioBuffer = Buffer.alloc(0);

        // ----- PHASE 2: SIMPLE AGENT REPLY -----
        const replyText = generateAgentReply(userText);
        console.log(`Agent Reply: ${replyText}`);
        ws.send(JSON.stringify({ type: 'reply_text', text: replyText }));

        // ----- PHASE 3: TTS -----
        const audioContent = await synthesizeSpeech(replyText);

        console.log('[WS] Sending TTS audio. Bytes:', audioContent.length);

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


        // 1. tell client to start collecting audio
        ws.send(JSON.stringify({ type: 'audio_start', format: 'mp3' }));

        // 2. send raw bytes as a binary frame
        ws.send(audioContent, { binary: true });

        // 3. tell client audio is done
        ws.send(JSON.stringify({ type: 'audio_end' }));
      }

      // You can add more command types here if needed:
      // else if (command.type === 'PING') { ... }
    } catch (e) {
      if (e instanceof SyntaxError) {
        console.warn('[WS] Non-JSON text frame received, ignoring:', text);
      } else {
        console.error('Error processing WebSocket message:', e);
      }
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.on('error', (error) => {
    console.error('WebSocket Error:', error);
  });
}
