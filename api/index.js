import { getReqId, requestContext } from './middleware/requestContext.js';

// Patch console methods to include request ID if available
for (const k of ['log', 'info', 'warn', 'error']) {
  const orig = console[k].bind(console);
  console[k] = (...args) => {
    const id = getReqId();
    return id ? orig(`[${id}]`, ...args) : orig(...args);
  };
}

import dotenv from 'dotenv';
dotenv.config();

import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

// routes
import deviceRoutes from './routes/Device/Device.controller.js';
import guestRoutes from './routes/Guest/Guest.controller.js';
import utteranceRoutes from './routes/Android/Utterance/Utterance.controller.js';
import bookingRoutes from './routes/Booking/Booking.controller.js';
import staffRoutes from './routes/Staff/Staff.controller.js';
import mappingRoutes from './routes/StaffRoomDepartmentRequestMapping/StaffRoomDepartmentRequestMapping.controller.js';
import faqRoutes from './routes/FAQ/FAQ.controller.js';
import intentsRoutes from './routes/Intents/Intent.controller.js';
import loginRoutes from './routes/Login/Login.controller.js';
import userRoutes from './routes/User/User.controller.js';
import landingPageRoutes from './routes/LandingPage/leads.js';

//Android Routes
import androidLoginRoutes from './routes/Android/AndroidLogin/AndroidLogin.controller.js';
import androidRequestRoutes from './routes/Android/AndroidRequest/AndroidRequest.controller.js';
import androidEventsTrackerRoutes from './routes/Android/AndroidEventTracker/AndroidEventTracker.controller.js';

import { runFunctionsOnServerStartup } from './common/services/startup.service.js';

// Middlewares
import authenticator from './common/middleware/Authenticator.middleware.js';

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
app.use(cookieParser());
app.use(
  cors({
    origin: ['https://app.roommitra.com', 'http://localhost:3000'],
    credentials: true,
  })
);

// UI routes
app.use('/devices', authenticator, deviceRoutes);
app.use('/intents', authenticator, intentsRoutes);
app.use('/guests', authenticator, guestRoutes);
app.use('/booking', authenticator, bookingRoutes);
app.use('/staff', authenticator, staffRoutes);
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

app.listen(PORT, () => console.log(`Server running on port: http://localhost:${PORT}`));

// run functions on server startup
runFunctionsOnServerStartup();

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
