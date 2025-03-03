// https://www.freecodecamp.org/news/create-crud-api-project/#heading-how-to-set-up-your-development-environment
// https://www.sammeechward.com/deploying-full-stack-js-to-aws-ec2

const dotenv = require('dotenv');
dotenv.config();

const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const deviceRoutes = require('./routes/Device/Device.controller.js');
const { runFunctionsOnServerStartup } = require('./common/services/startup.service.js');


const app = express();
const PORT = 3000

app.use(bodyParser.json());
app.use(cors());

app.use('/devices', deviceRoutes);

app.get('/', (req, res) => {
    console.log('[GET ROUTE]');
    res.send('HELLO FROM HOMEPAGE');
})

app.listen(PORT, () => console.log(`Server running on port: http://localhost:${PORT}`));

runFunctionsOnServerStartup()