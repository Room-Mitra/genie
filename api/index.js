import dotenv from 'dotenv';
dotenv.config();

import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';

import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

// routes
import deviceRoutes from '#routes/public/Device.controller.js';
import guestRoutes from '#routes/public/Guest.controller.js';
import utteranceRoutes from '#routes/public/Utterance.controller.js';
import bookingRoutes from '#routes/public/Booking.controller.js';
import staffRoutes from '#routes/admin/Staff.controller.js';
import mappingRoutes from '#routes/public/StaffRoomDepartmentRequestMapping.controller.js';
import faqRoutes from '#routes/public/FAQ.controller.js';
import intentsRoutes from '#routes/public/Intent.controller.js';
import loginRoutes from '#routes/public/Login.controller.js';
import userRoutes from '#routes/public/User.controller.js';
import landingPageRoutes from '#routes/public/leads.route.js';

//Android Routes
import androidLoginRoutes from '#routes/public/AndroidLogin.controller.js';
import androidRequestRoutes from '#routes/public/AndroidRequest.controller.js';
import androidEventsTrackerRoutes from '#routes/public/AndroidEventTracker.controller.js';

// Middlewares
import authenticator from '#middleware/Authenticator.middleware.js';
import adminAuthenticator from '#middleware/AdminAuthenticator.middleware.js';

// Cache
import { warmCache as warmDevicesCache } from '#libs/Device.cache.js';
import { warmCache as warmIntentsCache } from '#libs/Intent.cache.js';

// Admin Routes
import adminHotelRoutes from '#routes/admin/Hotel.controller.js';

const app = express();
// use env var, fallback to 3000
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(
  cors({
    origin: ['http://localhost:3000', 'https://app.roommitra.com'],
  })
);

// UI routes
app.use('/devices', authenticator, deviceRoutes);
app.use('/intents', authenticator, intentsRoutes);
app.use('/guests', authenticator, guestRoutes);
app.use('/booking', authenticator, bookingRoutes);
app.use('/mapping', authenticator, mappingRoutes);
app.use('/faq', authenticator, faqRoutes);

// Android Routes
app.use('/android/utterance', authenticator, utteranceRoutes);
app.use('/android/request', authenticator, androidRequestRoutes);
app.use('/android/track-events', authenticator, androidEventsTrackerRoutes);

// routes which dont need auth
app.use('/user', userRoutes);
app.use('/login', loginRoutes);
app.use('/android/login', androidLoginRoutes);
app.use('/leads', landingPageRoutes);

// -------------------------
// Admin Routes
// -------------------------
app.use('/admin/hotels', adminAuthenticator, adminHotelRoutes);
app.use('/admin/staff', adminAuthenticator, staffRoutes);

app.listen(PORT, () => console.log(`Server running on port: http://localhost:${PORT}`));

// run functions on server startup
warmDevicesCache();
warmIntentsCache();

// swagger setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Room Mitra API',
      version: '1.0.0',
      description: 'API documentation for Room Mitra (Android + UI)',
    },
    servers: [
      { url: `Android`, description: 'Android APIs' },
      { url: `UI`, description: 'UI APIs' },
    ],
  },
  apis: ['./routes/**/*.js'], // Path to your route files
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- Health check endpoint ---
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});
