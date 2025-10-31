export const fetch_menu = {
  type: 'function',
  name: 'fetch_menu',
  description: `
    Return only the relevant parts of the food menu. 
    Do not include price information for items unless guest explicitly asks for prices.
    Don't suggest or offer any item or menu section that isn't provided to you.
    `,
  parameters: {
    type: 'object',
    properties: {
      sections: {
        type: 'array',
        items: { type: 'string' },
        description: 'Restrict to these sections (e.g., Breakfast, Indian).',
      },
      query: {
        type: 'string',
        description: 'Raw user ask, for keyword filter and semantic ranking.',
      },
      topK: { type: 'integer', default: 20, minimum: 1, maximum: 50 },
      withSectionsSummary: {
        type: 'boolean',
        default: true,
        description: 'Include per-section names if only a summary is needed.',
      },
    },
    required: ['hotelId'],
  },
};
