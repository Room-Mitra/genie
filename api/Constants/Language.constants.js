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
  },
  [Language.Kannada]: {
    languageCode: 'kn-IN',
    name: 'kn-IN-Wavenet-A',
    speakingRate: 1.1725,
  },
  [Language.Telugu]: {
    languageCode: 'te-IN',
    name: 'te-IN-Standard-A',
    speakingRate: 1.5,
  },
  [Language.Malayalam]: {
    languageCode: 'ml-IN',
    name: 'ml-IN-Wavenet-C',
    speakingRate: 1.5,
  },
  [Language.Hindi]: {
    languageCode: 'hi-IN',
    name: 'hi-IN-Wavenet-E',
    speakingRate: 1.5,
  },
  [Language.Tamil]: {
    languageCode: 'ta-IN',
    name: 'ta-IN-Wavenet-A',
    speakingRate: 1.5,
  },
};
