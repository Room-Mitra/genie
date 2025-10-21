// services/whatsapp.js
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const token = process.env.WHATSAPP_TOKEN;
const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

const sendWhatsAppTemplate = async (toPhoneNumber, roomNumber) => {
  const url = `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    to: toPhoneNumber,
    type: 'template',
    template: {
      name: 'room_service_notification', // Template name from Meta Console
      language: { code: 'en' },
      components: [
        {
          type: 'body',
          parameters: [
            {
              type: 'text',
              text: roomNumber,
            },
          ],
        },
      ],
    },
  };

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  try {
    await axios.post(url, payload, { headers });
  } catch (error) {
    console.error('Failed to send message:', error.response?.data || error.message);
  }
};

module.exports = { sendWhatsAppTemplate };
