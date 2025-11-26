// scripts/createRecognizer.ts
import { v2 as speech } from '@google-cloud/speech';

const location = 'asia-south1'; // defined early so we can use it in the client config

// ✅ CRITICAL FIX: Point the client to the regional server
const client = new speech.SpeechClient({
  apiEndpoint: `${location}-speech.googleapis.com` // e.g., asia-south1-speech.googleapis.com
});

async function createRecognizer(
  projectId,
  location,
  recognizerId,
  languageCode
) {
  const request = {
    parent: `projects/${projectId}/locations/${location}`,
    recognizerId,
    recognizer: {
      languageCodes: [languageCode],
      model: 'chirp_3',
      defaultRecognitionConfig: {
        autoDecodingConfig: {},
        features: {
          enableAutomaticPunctuation: true,
        },
      },
    },
  };

  try {
    const [operation] = await client.createRecognizer(request);
    console.log(`Creating ${recognizerId}...`);
    
    const [recognizer] = await operation.promise();
    console.log(`✅ Created recognizer: ${recognizer.name}`);
  } catch (error) {
    if (error.code === 6) { 
       console.log(`⚠️ Recognizer ${recognizerId} already exists. Skipping.`);
    } else {
       console.error(`❌ Failed to create ${recognizerId}:`, error);
    }
  }
}

(async () => {
  const projectId = 'the-slate-478415-d3';
  
  // Note: We use the 'location' variable defined at the top of the file

  // latest_long models
  // await createRecognizer(projectId, location, 'roommitra-en-in', 'en-IN');
  // await createRecognizer(projectId, location, 'roommitra-hi-in', 'hi-IN');


  await createRecognizer(projectId, location, 'roommitra-kn-in', 'kn-IN');
  await createRecognizer(projectId, location, 'roommitra-te-in', 'te-IN');
  await createRecognizer(projectId, location, 'roommitra-ml-in', 'ml-IN');
  await createRecognizer(projectId, location, 'roommitra-ta-in', 'ta-IN');
})();
