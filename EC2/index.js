// https://www.freecodecamp.org/news/create-crud-api-project/#heading-how-to-set-up-your-development-environment
// https://www.sammeechward.com/deploying-full-stack-js-to-aws-ec2

const dotenv = require('dotenv');
dotenv.config();

const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

// routes
const deviceRoutes = require('./routes/Device/Device.controller.js');
const guestRoutes = require('./routes/Guest/Guest.controller.js');
const bookingRoutes = require('./routes/Booking/Booking.controller.js');
const staffRoutes = require('./routes/Staff/Staff.controller.js');
const intentsRoutes = require("./routes/Intents/Intent.controller.js")
const loginRoutes = require("./routes/Login/Login.controller.js")
const landingPageRoutes = require("./routes/LandingPage/leads.js")

const { runFunctionsOnServerStartup } = require('./common/services/startup.service.js');

// Middlewares
const { authenticator } = require('./common/middleware/Authenticator.middleware.js');

const app = express();
const PORT = 3000

app.use(bodyParser.json());
app.use(cors());

// Middleware to Authenticate JWT


app.use('/devices', authenticator, deviceRoutes);
app.use('/intents', authenticator, intentsRoutes);
app.use('/guests', authenticator, guestRoutes);
app.use('/booking', authenticator, bookingRoutes);
app.use('/staff', authenticator, staffRoutes);


app.use('/login', loginRoutes);
app.use('/leads', landingPageRoutes);


// Serve static landing page
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    // res.redirect(301, 'https://theroomgenie.vercel.app/faq'); // restart app
    res.sendFile(path.join(__dirname, 'public/LandingPage/landing.html'));
})

app.listen(PORT, () => console.log(`Server running on port: http://localhost:${PORT}`));

runFunctionsOnServerStartup()