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
              title: 'Indian Music Experience',
              description: `India's first interactive music museum, featuring a Sound Garden, nine interactive exhibit galleries, and lots more to showcase the diversity of Indian music.`,
              asset: {
                url: `https://roommitra-assets-bucket.s3.ap-south-1.amazonaws.com/01K8YNZK107SWYMN3XSCHTFRFW/PROMOTIONS/AGLIO+OLIO.png`,
              },
            },
            {
              title: 'Spaghetti Aglio',
              asset: {
                url: `https://roommitra-assets-bucket.s3.ap-south-1.amazonaws.com/01K8YNZK107SWYMN3XSCHTFRFW/PROMOTIONS/2.png`,
              },
            },
            {
              title: 'Stir Fry Veggies',
              asset: {
                url: `https://roommitra-assets-bucket.s3.ap-south-1.amazonaws.com/01K8YNZK107SWYMN3XSCHTFRFW/PROMOTIONS/3.png`,
              },
            },
            {
              title: 'Subzi Do Pyaza',
              asset: {
                url: `https://roommitra-assets-bucket.s3.ap-south-1.amazonaws.com/01K8YNZK107SWYMN3XSCHTFRFW/PROMOTIONS/4.png`,
              },
            },
            {
              title: 'Eggspectation',
              asset: {
                url: `https://roommitra-assets-bucket.s3.ap-south-1.amazonaws.com/01K8YNZK107SWYMN3XSCHTFRFW/PROMOTIONS/5.png`,
              },
            },
            {
              title: 'Cornito Paneer',
              asset: {
                url: `https://roommitra-assets-bucket.s3.ap-south-1.amazonaws.com/01K8YNZK107SWYMN3XSCHTFRFW/PROMOTIONS/6.png`,
              },
            },
            {
              title: 'Bhatti Ka Murgh',
              asset: {
                url: `https://roommitra-assets-bucket.s3.ap-south-1.amazonaws.com/01K8YNZK107SWYMN3XSCHTFRFW/PROMOTIONS/7.png`,
              },
            },
            {
              title: 'Afghani Gosht Korma',
              asset: {
                url: `https://roommitra-assets-bucket.s3.ap-south-1.amazonaws.com/01K8YNZK107SWYMN3XSCHTFRFW/PROMOTIONS/8.png`,
              },
            },
            {
              title: 'Palak Methi Murgh',
              asset: {
                url: `https://roommitra-assets-bucket.s3.ap-south-1.amazonaws.com/01K8YNZK107SWYMN3XSCHTFRFW/PROMOTIONS/9.png`,
              },
            },
            {
              title: 'Bhuna Mutton Kheema',
              asset: {
                url: `https://roommitra-assets-bucket.s3.ap-south-1.amazonaws.com/01K8YNZK107SWYMN3XSCHTFRFW/PROMOTIONS/10.png`,
              },
            },
            {
              title: 'Egg Hyderabadi Curry',
              asset: {
                url: `https://roommitra-assets-bucket.s3.ap-south-1.amazonaws.com/01K8YNZK107SWYMN3XSCHTFRFW/PROMOTIONS/11.png`,
              },
            },
            {
              title: 'Paneer Ghee Roast',
              asset: {
                url: `https://roommitra-assets-bucket.s3.ap-south-1.amazonaws.com/01K8YNZK107SWYMN3XSCHTFRFW/PROMOTIONS/12.png`,
              },
            },
            {
              title: 'Khubani Matar Kebab',
              asset: {
                url: `https://roommitra-assets-bucket.s3.ap-south-1.amazonaws.com/01K8YNZK107SWYMN3XSCHTFRFW/PROMOTIONS/13.png`,
              },
            },
            {
              title: 'Shahi Pulao',
              asset: {
                url: `https://roommitra-assets-bucket.s3.ap-south-1.amazonaws.com/01K8YNZK107SWYMN3XSCHTFRFW/PROMOTIONS/14.png`,
              },
            },
            {
              title: 'Cigarillos',
              asset: {
                url: `https://roommitra-assets-bucket.s3.ap-south-1.amazonaws.com/01K8YNZK107SWYMN3XSCHTFRFW/PROMOTIONS/15.png`,
              },
            },
            {
              title: 'Andhra Mutton Fry',
              asset: {
                url: `https://roommitra-assets-bucket.s3.ap-south-1.amazonaws.com/01K8YNZK107SWYMN3XSCHTFRFW/PROMOTIONS/16.png`,
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
