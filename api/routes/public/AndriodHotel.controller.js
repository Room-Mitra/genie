import express from 'express';

const router = express.Router();

router.get('/config', async (req, res) => {
  try {
    // Fetch hotel data from the database or another service
    const config = {
      amenities: [
        {
          title: 'spa',
          description: 'book a spa',
          headerImg: {
            url: '',
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
          title: 'spa',
          description: 'book a spa',
          headerImg: {
            url: '',
          },
          actions: [
            {
              label: 'Book an appointment',
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
                url: '',
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
