import { listAmenities, listConciergeServices } from '#services/Hotel.service.js';
import express from 'express';

const router = express.Router();

router.get('/config', async (req, res) => {
  try {
    const { hotelId } = req.deviceData;
    const amenities = await listAmenities({ hotelId });
    const concierge = await listConciergeServices({ hotelId });

    const config = {
      amenities,
      concierge,
      promotions: {
        carousel: {
          cards: [
            {
              title: 'Order Vegan Biryani',
              description: 'Spare the animals!',
              asset: {
                url: `https://www.sharmispassions.com/wp-content/uploads/2022/03/VegBiryani4.jpg`,
              },
            },
            {
              title: 'Party Party',
              description: 'Spare the animals!',
              asset: {
                url: `https://plus.unsplash.com/premium_photo-1683121126477-17ef068309bc?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cGFydHl8ZW58MHx8MHx8fDA%3D&fm=jpg&q=60&w=3000`,
              },
            },
          ],
        },
      },
    };
    res.json(config);
  } catch (error) {
    console.error('Error fetching hotels:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
