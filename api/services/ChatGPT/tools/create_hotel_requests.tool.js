export const create_hotel_requests = {
  type: 'function',
  name: 'create_hotel_requests',
  description:
    'Create one or more hotel service requests for staff when the guest asks for help, maintenance, room service, or other hotel support. ',
  strict: true,
  parameters: {
    type: 'object',
    properties: {
      requests: {
        type: 'array',
        description: 'Requests that need to be created',
        items: {
          type: 'object',
          properties: {
            department: {
              type: 'string',
              description: `
          Choose the most appropriate category:
          - house_keeping: Cleaning, towels, bedsheets, bathroom supplies, laundry pickup.
          - room_service: Food or beverages ordered to the room, in-room dining.
          - front_office: Late checkout, billing, key issues, room changes, reservation questions.
          - concierge: Airport transfers, taxi bookings, valet, luggage pickup or drop.
          - facilities: Maintenance or engineering issues like electrical, plumbing, AC, lights, TV, or Wi-Fi.
          - general_enquiry: Simple information requests that usually do not need staff action.`,
              enum: [
                'house_keeping',
                'room_service',
                'front_office',
                'concierge',
                'facilities',
                'general_enquiry',
              ],
            },

            requestType: {
              type: 'string',
              description:
                "Short title for the request. Example: 'Need extra towels', 'AC not cooling', 'Order: Masala dosa and coffee'.",
            },

            details: {
              type: 'string',
              description:
                "Long form details or the guest's exact words. Include specifics like counts, timings, or preferences.",
            },

            priority: {
              type: 'string',
              enum: ['low', 'normal', 'high'],
              description:
                'Urgency. Use HIGH if it blocks comfort or safety, e.g., water leak, AC not working, electrical fault.',
            },
            // Used only when department === 'room_service'
            cart: {
              type: ['object', 'null'],
              description:
                'Food order details for in-room dining. Only include when the request is a food or beverage order.',
              properties: {
                items: {
                  type: 'array',
                  description: 'Line items from the menu.',
                  items: {
                    type: 'object',
                    properties: {
                      itemId: {
                        type: 'string',
                        description: 'Menu item ID. Prefer IDs over names. If unknown, fill name.',
                      },
                      name: {
                        type: 'string',
                        description:
                          'Name of the item asked by the guest, mapped to what is exactly on the menu',
                      },
                      quantity: {
                        type: 'integer',
                        minimum: 1,
                        maximum: 50,
                        description: 'How many units of this item.',
                      },
                      notes: {
                        type: ['string', 'null'],
                        description:
                          "Per-item special instructions. Example: 'less spicy', 'no onions'.",
                      },
                    },
                    required: ['itemId', 'name', 'quantity', 'notes'],
                    additionalProperties: false,
                  },
                },
                instructions: {
                  type: ['string', 'null'],
                  description:
                    "Order-level instructions to the kitchen. Example: 'Deliver at 8:30 PM', 'Call before delivery'.",
                },
                scheduledAt: {
                  type: ['string', 'null'],
                  format: 'date-time',
                  description: 'Optional ISO datetime when the guest wants the order delivered.',
                },
              },
              required: ['items', 'instructions', 'scheduledAt'],
              additionalProperties: false,
            },
          },
          required: ['department', 'requestType', 'details', 'priority', 'cart'],
          additionalProperties: false,
        },
      },
    },
    required: ['requests'],
    additionalProperties: false,
  },
};
