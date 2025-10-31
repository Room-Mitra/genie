export const get_hotel_details = {
  type: 'function',
  name: 'get_hotel_details',
  description: 'Return the name and address of the hotel where this assistant is deployed.',
  parameters: {
    type: 'object',
    properties: {}, // no inputs
    additionalProperties: false,
  },
};
