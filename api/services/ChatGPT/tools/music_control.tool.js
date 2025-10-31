export const music_control = {
  type: 'function',
  name: 'music_control',
  description: `
Control the in-room music player. 
When a guest asks to play specific music, create an 'agents' array instructing the local app to play songs.
Do NOT create a hotel service request.
If the guest asks to stop the music, return an empty 'parameters' array.
If the guest asks for an artist, playlist, or mood (e.g., "play A. R. Rahman songs" or "play romantic music"), 
return a short list (10-15) of representative song titles as parameters.`,
  strict: true,
  parameters: {
    type: 'object',
    properties: {
      agents: {
        type: 'array',
        description:
          'List of local actions for the app to perform. Each agent specifies an action type and parameters.',
        items: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['Music'],
              description: "Type of local agent to invoke. Must be 'Music' for music playback.",
            },
            parameters: {
              type: 'array',
              description:
                'Array of specific song titles to play. Leave empty to stop music playback.',
              items: {
                type: 'string',
                description: "Song title (e.g., 'Kun Faya Kun', 'Vaseegara').",
              },
            },
          },
          required: ['type', 'parameters'],
          additionalProperties: false,
        },
      },
    },
    required: ['agents'],
    additionalProperties: false,
  },
};
