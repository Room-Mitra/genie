export const fetch_menu = {
  type: 'function',
  name: 'fetch_menu',
  description: `
    Return only the relevant parts of the food menu. 
    Do not include price information for items unless guest explicitly asks for prices.
    Don't suggest or offer any item or menu section that isn't provided to you.
    `,
  strict: true,
  parameters: {
    type: 'object',
    properties: {
      mode: {
        type: 'string',
        enum: ['sections', 'items'],
        description:
          'sections = return only available_sections + counts + small samples. items = return items.',
      },
      sections: {
        type: 'array',
        items: { type: 'string' },
        description: 'Optional. When provided, return only items from these sections.',
      },
      topK: {
        type: 'integer',
        minimum: 1,
        maximum: 50,
        default: 8,
        description: 'how many top items are needed in the result',
      },
    },
    required: ['mode', 'sections', 'topK'],
    additionalProperties: false,
  },
};
