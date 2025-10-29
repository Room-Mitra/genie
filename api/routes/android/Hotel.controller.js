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
            url: `https://media.istockphoto.com/id/1325095289/photo/still-life-closeup-of-a-tranquil-spa-arrangement.jpg?s=612x612&w=0&k=20&c=yrNXIAA1mSSzypzbKMTl4807nRG4S8rs5RsWb-J0M9U=`,
          },
          actions: [
            {
              label: 'Request a call back to know more',
            },
          ],
        },
        {
          title: 'Swimming Pool',
          description: 'Dive into our sparkling outdoor swimming pool, open daily from <Primary>6 AM to 10 PM</Primary>. ',
          headerImg: {
            url: `https://img.freepik.com/free-photo/cheerful-children-rejoicing-jumping-swimming-pool_176420-1828.jpg?semt=ais_hybrid&w=740&q=80`,
          },
          actions: [],
        },
      ],
      concierge: [
        {
          title: 'Airport Taxi',
          description: 'Private airport taxi to drop you off',
          headerImg: {
            url: `https://media.istockphoto.com/id/519870714/photo/taxi.jpg?s=612x612&w=0&k=20&c=mzlqm5eisvu-B7hCyOK3LAsR4ugFTsHtC2kMWUmbA0Y=`,
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

//hi
