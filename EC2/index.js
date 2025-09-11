// https://www.freecodecamp.org/news/create-crud-api-project/#heading-how-to-set-up-your-development-environment
// https://www.sammeechward.com/deploying-full-stack-js-to-aws-ec2

import dotenv from 'dotenv';
dotenv.config();

import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';

// routes
import deviceRoutes from './routes/Device/Device.controller.js';
import guestRoutes from './routes/Guest/Guest.controller.js';
import utteranceRoutes from './routes/Utterance/Utterance.controller.js';
import bookingRoutes from './routes/Booking/Booking.controller.js';
import staffRoutes from './routes/Staff/Staff.controller.js';
import mappingRoutes from './routes/StaffRoomDepartmentRequestMapping/StaffRoomDepartmentRequestMapping.controller.js';
import faqRoutes from './routes/FAQ/FAQ.controller.js';
import intentsRoutes from './routes/Intents/Intent.controller.js';
import loginRoutes from './routes/Login/Login.controller.js';
import landingPageRoutes from './routes/LandingPage/leads.js';

import { runFunctionsOnServerStartup } from './common/services/startup.service.js';

// Middlewares
import authenticator from './common/middleware/Authenticator.middleware.js';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(cors());

// Middleware to Authenticate JWT

app.use('/devices', authenticator, deviceRoutes);
app.use('/intents', authenticator, intentsRoutes);
app.use('/guests', authenticator, guestRoutes);
app.use('/booking', authenticator, bookingRoutes);
app.use('/staff', authenticator, staffRoutes);
app.use('/mapping', authenticator, mappingRoutes);
app.use('/faq', authenticator, faqRoutes);
app.use('/utterance', authenticator, utteranceRoutes);

app.use('/login', loginRoutes);
app.use('/leads', landingPageRoutes);

// Serve static landing page
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/LandingPage/landing.html'));
});

app.get('/commands', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/Commands/Commands.html'));
});

app.get('/commands', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/Commands/Commands.html'));
})

app.listen(PORT, () => console.log(`Server running on port: http://localhost:${PORT}`));

runFunctionsOnServerStartup();
