import express from 'express';

const router = express.Router();

// === Converter ===
const BASE_EXAMPLE_URL = 'http://example.com/images';

router.get('/config', async (req, res) => {
  try {
    // Fetch hotel data from the database or another service
    const config = {
      amenities: [
        {
          title: 'Wellness Spa',
          description: 'Very relaxing, and comes highly recommended by all our guests',
          headerImg: {
            url: `${BASE_EXAMPLE_URL}/wellness-spa.jpg`,
          },
          actions: [
            {
              label: 'Book an appointment',
            },
          ],
        },
      ],
      concierge: [
        {
          title: 'Airport Taxi',
          description: 'Private airport taxi to drop you off',
          headerImg: {
            url: `${BASE_EXAMPLE_URL}/airport-taxi.jpg`,
          },
          actions: [
            {
              label: 'Schedule',
            },
          ],
        },
      ],
      lockScreen: {
        carousel: {
          cards: [
            {
              title: 'Have free time?',
              description: 'Find out exciting events nearby',
              asset: {
                url: `${BASE_EXAMPLE_URL}/free-time.jpg`,
              },
            },
          ],
        },
      },
      promotions: {
        carousel: {
          cards: [
            {
              title: 'Order Vegan Biryani',
              description: 'Spare the animals!',
              asset: {
                url: `${BASE_EXAMPLE_URL}/vegan-biryani.jpg`,
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

//hi
