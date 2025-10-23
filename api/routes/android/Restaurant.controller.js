import { toIsoString } from '#common/timestamp.helper.js';
import express from 'express';
import { ulid } from 'ulid';

const router = express.Router();

// === Paste your original object here ===
const restaurantMenu = {
  restaurantMenu: {
    Soups: [
      ['Pumpkin Soup', 160],
      ['Lemon Coriander Soup', 180],
      ['Cream of Broccoli', 190],
      ['Sweet Corn (Veg)', 180],
      ['Sweet Corn (Chicken)', 270],
      ['Hot and Sour (Veg)', 180],
      ['Hot and Sour (Chicken)', 270],
      ['Manchow Soup (Veg)', 180],
      ['Manchow Soup (Chicken)', 270],
    ],
    Salads: [
      ['Green Salad', 160],
      ['Pineapple Mint Salad', 180],
      ['Greek Salad', 190],
      ['Hawaiian Chicken Salad', 230],
    ],
    Starters: [
      ['French Fries', 160],
      ['Nuggets (Veg)', 220],
      ['Veg Samosa', 220],
      ['Veg/Onion Pakora', 140],
      ['Cauliflower Ularathu', 260],
      ['Honey Chilly Potato', 260],
      ['Baby Corn Manchurian', 310],
      ['Paneer Hot Garlic', 310],
      ['Nuggets (Chicken)', 260],
      ['Chicken 65', 380],
      ['Chicken Malli Peralan', 380],
      ['Chicken Kondattam', 380],
      ['Chicken Lollipop', 380],
      ['Prawns Tawa Fry', 450],
      ['Mutton Pepper Fry', 560],
      ['Mutton Coconut Fry', 560],
    ],
    'Short Bites': [
      ['Club Sandwich', 220],
      ['Veg Sandwich', 160],
      ['Chicken Sandwich', 200],
      ['Egg Sandwich', 180],
      ['Pakoras (Onion)', 120],
      ['Pakoras (Veg)', 130],
      ['Pakoras (Egg)', 140],
      ['Momos (Veg)', 235],
      ['Momos (Chicken)', 260],
      ['Kathi Roll (Paneer)', 180],
      ['Kathi Roll (Egg)', 200],
      ['Kathi Roll (Chicken)', 220],
    ],
    Poultry: [
      ['Chicken Mulagittathu', 295],
      ['Chicken Mappas', 260],
      ['Chicken Ghee Roast', 280],
      ['Nadan Chicken Curry', 260],
      ['Chicken Varutharachathu', 260],
      ['Chicken Rara Masala', 280],
      ['Kadai Chicken', 295],
      ['Butter Chicken Masala', 295],
    ],
    Veggies: [
      ['Kadai Veg', 295],
      ['Aloo Shimla', 260],
      ['Nilgiri Veg Korma', 280],
      ['Aloo Jeera', 260],
      ['Aloo Mutter Masala', 260],
      ['Veg Hyderabadi', 280],
      ['Paneer Butter Masala', 295],
      ['Palak Paneer', 295],
      ['Paneer Lazeez', 295],
      ['Bindi Masala', 260],
      ['Mushroom Masala', 280],
      ['Dal Tadka', 225],
      ['Panjabi Dal Tadka', 250],
    ],
    Chinese: [
      ['Hot Garlic Chicken', 415],
      ['Chilly Chicken', 415],
      ['Chicken Manchurian', 415],
      ['Dragon Chicken', 415],
      ['Schezwan Chicken', 430],
      ['Ginger Chicken', 450],
      ['Garlic Prawns', 420],
      ['Chilly Prawns', 450],
      ['Chilly Mushroom', 380],
      ['Cauliflower Manchurian', 400],
      ['Chilly Fish', 400],
    ],
    Fish: [
      ['Fish Tawa Fry (2 slices)', 480],
      ['Fish Mulagittathu', 430],
      ['Malabar Fish Curry', 440],
      ['Kerala Fish Curry', 440],
      ['Fish Moilee', 450],
      ['Fish Masala', 450],
      ['Prawns Roast', 450],
      ['Prawns Masala', 450],
      ['Prawns Ularthu', 450],
    ],
    'Local Cuisine': [
      ['Pidi with Chicken Curry', 550],
      ['Bamboo Puttu Chicken', 450],
      ['Bamboo Puttu (Fish/Prawns)', 500],
      ['Bamboo Puttu (Paneer/Mushroom)', 400],
      ['Bamboo Puttu Mix Veg', 375],
      ['Paal Kappa with Veg Mappas', 400],
      ['Paal Kappa with Fish Curry', 500],
      ['Bamboo Biriyani Veg', 400],
      ['Bamboo Biriyani Chicken', 500],
      ['Bamboo Biriyani Fish/Prawns', 500],
    ],
    Mutton: [
      ['Mutton Rogan Josh', 560],
      ['Kollam Mutton Curry', 540],
      ['Mutton Korma', 530],
      ['Mutton Pepper Fry', 560],
      ['Mutton Masala', 530],
    ],
    Bread: [
      ['Kerala Paratha', 35],
      ['Nool Paratha', 35],
      ['Wheat Paratha', 40],
      ['Chappathi', 25],
      ['Phulka', 20],
      ['Appam', 25],
    ],
    'Rice and Noodles': [
      ['Plain Rice', 160],
      ['Veg Pulao', 250],
      ['Peas Pulao', 230],
      ['Jeera Rice', 200],
      ['Tomato Rice', 200],
      ['Lemon Rice', 200],
      ['Veg Biriyani', 320],
      ['Curd Rice', 220],
      ['Ghee Rice', 260],
      ['Egg Biriyani', 360],
      ['Chicken Biriyani', 400],
      ['Mutton Biriyani', 580],
      ['Prawns Biriyani', 500],
      ['Fish Biriyani', 450],
      ['Veg Fried Rice', 280],
      ['Egg Fried Rice', 280],
      ['Chicken Fried Rice', 300],
      ['Schezwan Fried Rice', 350],
      ['Prawns Fried Rice', 350],
      ['Veg Noodles', 310],
      ['Egg Noodles', 330],
      ['Chicken Noodles', 380],
      ['Schezwan Noodles', 400],
    ],
    Grilled: [
      ['Grilled Chicken (Pepper/Chilli/Hariyali)', '700/1200'],
      ['Chicken Tikka (Malai/Red Chilli/Hariyali)', 550],
      ['Grilled Veg (Paneer/Mushroom)', 400],
      ['Fish Tikka (Basa)', 450],
    ],
    Pasta: [
      ['Alfredo Veg', 330],
      ['Alfredo Chicken', 380],
      ['Arrabbiata Veg', 330],
      ['Arrabbiata Chicken', 380],
      ['Rosso Veg', 330],
      ['Rosso Chicken', 380],
    ],
    Desserts: [
      ['Butter Banana Gulkand', 260],
      ['Palada with Ice Cream', 250],
      ['Gulab Jamun (2 nos)', 250],
      ['Gajar Ka Halwa', 235],
      ['Fruit Salad with Ice Cream', 250],
      ['Ice Cream (Single Scoop)', 150],
    ],
    Drinks: [
      ['Fresh Lime Soda/Water', 80],
      ['Virgin Mojito', 140],
      ['Virgin Mary', 150],
      ['Virgin Pina Colada', 150],
      ['Buttermilk', 150],
    ],
    Milkshakes: [
      ['Strawberry Milkshake', 180],
      ['Chocolate Milkshake', 180],
      ['Vanilla Milkshake', 180],
      ['Oreo Milkshake', 180],
      ['Banana Milkshake', 180],
    ],
    Tea: [
      ['Kerala Chai', 50],
      ['Ginger Masala Chai', 80],
      ['Iced Tea', 80],
      ['Lemon Tea', 50],
    ],
    Coffee: [
      ['Coffee', 50],
      ['Filter Coffee', 80],
      ['Iced Americano', 140],
      ['Cold Coffee', 130],
    ],
  },
};

// === Converter ===
const BASE_IMAGE_URL = 'http://example.com/images';


function slugify(str) {
  return String(str)
    .toLowerCase()
    .replace(/['"]/g, '') // remove quotes
    .replace(/[^a-z0-9]+/g, '-') // non-alphanum -> hyphen
    .replace(/^-+|-+$/g, ''); // trim hyphens
}

function formatPrice(p) {
  if (typeof p === 'number' && Number.isFinite(p)) {
    return p.toFixed(2);
  }
  if (typeof p === 'string') {
    return p; // keep multi-price strings like "700/1200"
  }
  return String(p);
}

function convertMenu(input) {
  if (!input || !input.restaurantMenu || typeof input.restaurantMenu !== 'object') {
    throw new Error("Input must have a 'restaurantMenu' object.");
  }

  const sections = [];
  for (const [sectionName, items] of Object.entries(input.restaurantMenu)) {
    const convertedItems = (items || []).map(([itemName, price]) => ({
      name: itemName,
      unitPrice: formatPrice(price),
      image: { url: `${BASE_IMAGE_URL}/${slugify(itemName)}.jpg` },
      itemId: ulid(),
    }));

    sections.push({
      name: sectionName,
      items: convertedItems,
    });
  }
  return sections;
}

router.get('/menu', async (req, res) => {
  const now = new Date();

  res.status(200).json({
    sections: convertMenu(restaurantMenu),
    createdAt: toIsoString(now),
    title: 'All day menu',
    menuId: ulid(),
  });
});

router.post('/order', async (req, res) => {
  const now = new Date();
  const twentyMinsLater = new Date().setMinutes(new Date().getMinutes + 20);
  const bookingId = ulid();

  res.status(200).json({
    requestId: ulid(),
    status: 'acknowledgeded',
    createdAt: toIsoString(now),
    estimatedTimeOfFulfillment: toIsoString(twentyMinsLater),
    department: 'Room Service',
    requestType: 'Breakfast',
    bookingId: bookingId,
    order: {
      orderId: ulid(),
      estimatedTimeOfFulfillment: toIsoString(twentyMinsLater),
      items: [
        {
          itemId: ulid(),
          name: 'Dosa',
          unitPrice: '15',
          quantity: 3,
          total: '45.00',
          image: {
            url: 'https://roommitra.com/room-mitra-logo.png',
          },
        },
        {
          itemId: ulid(),
          name: 'Idly',
          unitPrice: '15',
          quantity: 3,
          total: '45.00',
          image: {
            url: 'https://roommitra.com/room-mitra-logo.png',
          },
        },
      ],
      instruction: 'coffee without sugar',
      total: '200',
    },
  });
});

export default router;
