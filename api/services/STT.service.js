import { STTClient } from '#clients/STT.client.js';
import { VoiceForLanguage } from '#Constants/Language.constants.js';

export async function transcribeAudio(audioBuffer, language) {
  try {
    if (!audioBuffer || !audioBuffer.length) {
      console.warn('[STT] Empty audioBuffer passed to transcribeAudio');
      return '';
    }

    const audioBytes = audioBuffer.toString('base64');

    const request = {
      audio: { content: audioBytes },
      config: {
        encoding: 'LINEAR16',
        sampleRateHertz: 16000,
        languageCode: VoiceForLanguage[language].languageCode,
      },
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

    // console.log('[STT] Final transcription:', transcription);
    return transcription;
  } catch (err) {
    console.error('[STT] Error during transcription:', err);
    return 'Transcription failed.';
  }
}
