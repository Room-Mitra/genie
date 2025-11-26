export const Language = {
  English: 'english',
  Kannada: 'kannada',
  Telugu: 'telugu',
  Tamil: 'tamil',
  Malayalam: 'malayalam',
  Hindi: 'hindi',
};

export const Languages = Object.values(Language);

export const VoiceForLanguage = {
  [Language.English]: {
    languageCode: 'en-IN',
    name: 'en-IN-Neural2-D',
    speakingRate: 1.2,
    recognizer: 'projects/20180701242/locations/asia-south1/recognizers/roommitra-en-in',
  },
  [Language.Kannada]: {
    languageCode: 'kn-IN',
    name: 'kn-IN-Wavenet-A',
    speakingRate: 1.1725,
    recognizer: 'projects/20180701242/locations/asia-south1/recognizers/roommitra-kn-in',
  },
  [Language.Telugu]: {
    languageCode: 'te-IN',
    name: 'te-IN-Standard-A',
    speakingRate: 1.1,
    recognizer: 'projects/20180701242/locations/asia-south1/recognizers/roommitra-te-in',
  },
  [Language.Malayalam]: {
    languageCode: 'ml-IN',
    name: 'ml-IN-Wavenet-C',
    speakingRate: 1.1,
    recognizer: 'roommitra-ml-in',
  },
  [Language.Hindi]: {
    languageCode: 'hi-IN',
    name: 'hi-IN-Wavenet-E',
    speakingRate: 1.1,
    recognizer: 'projects/20180701242/locations/asia-south1/recognizers/roommitra-hi-in',
  },
  [Language.Tamil]: {
    languageCode: 'ta-IN',
    name: 'ta-IN-Wavenet-A',
    speakingRate: 1.1,
    recognizer: 'roommitra-ta-in',
  },
};
