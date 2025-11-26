import { v2 } from '@google-cloud/speech';
export const STTClient = new v2.SpeechClient({
  apiEndpoint: `asia-south1-speech.googleapis.com`,
});

/**
 * Stream a single utterance buffer to Google STT v2 and emit partial/final transcripts.
 *
 * @param {object} params
 * @param {string} params.recognizerName  Full recognizer resource name.
 * @param {Buffer} params.audioBuffer     PCM16 audio buffer for this utterance.
 * @param {(text: string) => void} [params.onPartial] Called on interim transcripts.
 * @param {(text: string) => void} [params.onFinal]   Called on final transcript.
 */
export function streamingTranscribe({ recognizerName, audioBuffer, onPartial, onFinal }) {
  return new Promise((resolve, reject) => {
    if (!recognizerName) {
      return reject(new Error('streamingTranscribe: recognizerName is required'));
    }
    if (!audioBuffer || !audioBuffer.length) {
      return resolve('');
    }

    const stream = STTClient._streamingRecognize()
      .on('error', (err) => {
        reject(err);
      })
      .on('data', (data) => {
        if (!data || !data.results || !data.results.length) return;

        const result = data.results[0];
        const alt = result.alternatives && result.alternatives[0];
        const transcript = (alt && alt.transcript) || '';
        if (!transcript) return;

        if (result.isFinal) {
          if (onFinal) onFinal(transcript);
        } else {
          if (onPartial) onPartial(transcript);
        }
      })
      .on('end', () => {
        resolve();
      });

    // Important part: tell v2 exactly what we are sending.
    // Your Agent.jsx sends 16 kHz mono Int16 PCM (SAMPLE_RATE = 16000).
    stream.write({
      recognizer: recognizerName,
      streamingConfig: {
        config: {
          explicitDecodingConfig: {
            encoding: 'LINEAR16',
            sampleRateHertz: 16000,
            audioChannelCount: 1,
          },
        },
        streamingFeatures: {
          interimResults: true,
        },
      },
    });

    // Feed the utterance buffer in small chunks.
    const CHUNK_SIZE = 3200; // roughly 100 ms at 16 kHz mono 16-bit
    for (let offset = 0; offset < audioBuffer.length; offset += CHUNK_SIZE) {
      const chunk = audioBuffer.slice(offset, offset + CHUNK_SIZE);
      stream.write({ audio: chunk });
    }

    stream.end();
  });
}
