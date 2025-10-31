export const get_booking_details = {
  type: 'function',
  name: 'get_booking_details',
  description:
    'Returns the current booking details for this interaction. Includes guest details, check in, checkout times, and room details.',
  parameters: {
    type: 'object',
    properties: {}, // no inputs
    additionalProperties: false,
  },
};
