import dotenv from 'dotenv';
dotenv.config();

import { getReqId, requestContext } from './middleware/requestContext.js';

// Patch console methods to include request ID if available
for (const k of ['log', 'info', 'warn', 'error']) {
  const orig = console[k].bind(console);
  console[k] = (...args) => {
    const id = getReqId();
    return id ? orig(`[${id}]`, ...args) : orig(...args);
  };
}

import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cron from 'node-cron';

// import swaggerUi from 'swagger-ui-express';
// import swaggerJsdoc from 'swagger-jsdoc';

// routes
import bookingRoutes from '#routes/webapp/Booking.controller.js';
import staffRoutes from '#routes/webapp/Staff.controller.js';
import loginRoutes from '#routes/webapp/Login.controller.js';
import userRoutes from '#routes/webapp/User.controller.js';
import websiteRoutes from '#routes/webapp/Website.route.js';
import roomRoutes from '#routes/webapp/Room.controller.js';
import requestRoutes from '#routes/webapp/Request.controller.js';
import hotelRoutes from '#routes/webapp/Hotel.controller.js';
import imageRoutes from '#routes/webapp/Image.controller.js';
import orderRoutes from '#routes/webapp/Order.controller.js';

//Android Routes
import androidLoginRoutes from '#routes/android/Login.controller.js';
import androidRequestRoutes from '#routes/android/Request.controller.js';
import androidEventsTrackerRoutes from '#routes/android/EventTracker.controller.js';
import androidHotelRoutes from '#routes/android/Hotel.controller.js';
import androidRestaurantRoutes from '#routes/android/Restaurant.controller.js';
import androidConversationRoutes from '#routes/android/Conversation.controller.js';

// Middlewares
import authenticator from '#middleware/Authenticator.middleware.js';
import androidAuthenticator from '#middleware/AndroidAuthenticator.middleware.js';
import adminAuthenticator from '#middleware/AdminAuthenticator.middleware.js';

// Admin Routes
import adminHotelRoutes from '#routes/admin/Hotel.controller.js';
import adminStaffRoutes from '#routes/admin/Staff.controller.js';

import { checkDelayedRequests } from '#tasks/checkDelayedRequests.task.js';
import { create_hotel_requests } from '#services/ChatGPT/tools/create_hotel_requests.tool.js';
import { fetch_menu_items } from '#services/ChatGPT/tools/fetch_menu_items.tool.js';
import { get_amenities } from '#services/ChatGPT/tools/get_amenities.tool.js';
import { get_booking_details } from '#services/ChatGPT/tools/get_booking_details.tool.js';
import { get_concierge_services } from '#services/ChatGPT/tools/get_concierge_services.tool.js';
import { get_hotel_details } from '#services/ChatGPT/tools/get_hotel_details.tool.js';
import { get_previous_requests } from '#services/ChatGPT/tools/get_previous_requests.tool.js';
import { order_food } from '#services/ChatGPT/tools/order_food.tool.js';
import { handleFetchMenuItems } from '#services/Menu.service.js';

const app = express();
app.use(requestContext);

app.use(
  morgan((tokens, req, res) =>
    JSON.stringify({
      t: tokens.date(req, res, 'iso'),
      id: req.id,
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: Number(tokens.status(req, res)),
      'resp-ms': Number(tokens['response-time'](req, res)),
      'content-length': Number(tokens.res(req, res, 'content-length') || 0),
      ref: tokens.referrer(req, res),
      ua: tokens['user-agent'](req, res),
    })
  )
);

// use env var, fallback to 3000
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3002',
      'https://roommitra.com',
      'https://app.roommitra.com',
      'https://app-stage.roommitra.com',
    ],
  })
);

// UI routes
app.use('/requests', authenticator, requestRoutes);
app.use('/booking', authenticator, bookingRoutes);
app.use('/rooms', authenticator, roomRoutes);
app.use('/staff', authenticator, staffRoutes);
app.use('/hotel', authenticator, hotelRoutes);
app.use('/image', authenticator, imageRoutes);
app.use('/orders', authenticator, orderRoutes);

// Android Routes
app.use('/android/login', androidLoginRoutes);
app.use('/android/requests', androidAuthenticator, androidRequestRoutes);
app.use('/android/hotel', androidAuthenticator, androidHotelRoutes);
app.use('/android/track-events', androidAuthenticator, androidEventsTrackerRoutes);
app.use('/android/restaurant', androidAuthenticator, androidRestaurantRoutes);
app.use('/android/conversations', androidAuthenticator, androidConversationRoutes);

// routes which dont need auth
app.use('/user', userRoutes);
app.use('/login', loginRoutes);
app.use('/website', websiteRoutes);

// -------------------------
// Admin Routes
// -------------------------
app.use('/admin/hotels', adminAuthenticator, adminHotelRoutes);
app.use('/admin/staff', adminAuthenticator, adminStaffRoutes);

app.listen(PORT, () => console.log(`Server running on port: http://localhost:${PORT}`));

// swagger setup
// const swaggerOptions = {
//   definition: {
//     openapi: '3.0.0',
//     info: {
//       title: 'Room Mitra API',
//       version: '1.0.0',
//       description: 'API documentation for Room Mitra (Android + UI)',
//     },
//     servers: [
//       { url: `Android`, description: 'Android APIs' },
//       { url: `UI`, description: 'UI APIs' },
//     ],
//   },
//   apis: ['./routes/**/*.js'], // Path to your route files
// };
// const swaggerSpec = swaggerJsdoc(swaggerOptions);
// app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- Health check endpoint ---
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// --- Health check endpoint ---
app.get('/android/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

cron.schedule('*/2 * * * *', () => {
  checkDelayedRequests();
});

app.get('/chatgpt', async (req, res) => {
  // console.log(JSON.stringify(create_hotel_requests));
  // console.log(JSON.stringify(fetch_menu));
  // console.log(JSON.stringify(get_amenities));
  // console.log(JSON.stringify(get_booking_details));
  // console.log(JSON.stringify(get_concierge_services));
  // console.log(JSON.stringify(get_hotel_details));
  // console.log(JSON.stringify(get_previous_requests));
  // console.log(JSON.stringify(order_food));

  const m = await handleFetchMenuItems({
    hotelId: 'id-1',
    args: {
      mode: 'sections',
      sections: [],
      topK: 3,
    },
  });

  return res.status(200).json({ m });
});
