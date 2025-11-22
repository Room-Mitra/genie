import { TTSClient } from '#clients/TTS.client.js';
import { VoiceForLanguage } from '#Constants/Language.constants.js';

export async function synthesizeSpeech(text, language) {
  const { languageCode, name, speakingRate } = VoiceForLanguage[language];

  const request = {
    input: { text },
    voice: {
      languageCode,
      name,
    },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate,
    },
  };

  try {
    const [response] = await TTSClient.synthesizeSpeech(request);
    const audioBase64 = response.audioContent;

    if (!audioBase64) {
      console.warn('[TTS] Empty audioContent returned from TTS');
      return Buffer.alloc(0);
    }

    const audioBuffer = Buffer.from(audioBase64, 'base64');
    // console.log('[TTS] Audio buffer size:', audioBuffer.length);
    return audioBuffer;
  } catch (error) {
    console.error('[TTS] Error:', error);
    return Buffer.alloc(0);
  }
}
