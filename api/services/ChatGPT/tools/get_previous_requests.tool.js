export const get_previous_requests = {
  type: 'function',
  name: 'get_previous_requests',
  description:
    'Returns the previous requests the guest has made in their current stay. Each request has details about when the request was made, what its estimated time of fulfillment is, and when it was completed',
  parameters: {
    type: 'object',
    properties: {}, // no inputs
    additionalProperties: false,
  },
};
