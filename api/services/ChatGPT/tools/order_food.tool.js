export const order_food = {
  type: 'function',
  name: 'order_food',
  description: 'Place a room service order for food',
  strict: true,
  parameters: {
    type: 'object',
    properties: {
      cart: {
        type: 'object',
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
                  description: "Per-item special instructions. Example: 'less spicy', 'no onions'.",
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

      requestType: {
        type: 'string',
        description: "Short title for the request. Example: 'Order: Masala dosa and coffee'.",
      },

      details: {
        type: 'string',
        description:
          "Long form details or the guest's exact words. Include specifics like counts, timings, or preferences.",
      },
    },
    required: ['cart', 'requestType', 'details'],
    additionalProperties: false,
  },
};
