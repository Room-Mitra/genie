// services/whatsapp.js
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const token = process.env.WHATSAPP_TOKEN;
const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

export async function sendWhatsAppTemplate(toPhoneNumber, roomNumber) {
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
    const response = await axios.post(url, payload, { headers });
  } catch (error) {
    console.error('Failed to send message:', error.response?.data || error.message);
  }
}
