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

// import swaggerUi from 'swagger-ui-express';
// import swaggerJsdoc from 'swagger-jsdoc';

// routes
import bookingRoutes from '#routes/webapp/Booking.controller.js';
import staffRoutes from '#routes/webapp/Staff.controller.js';
import loginRoutes from '#routes/webapp/Login.controller.js';
import userRoutes from '#routes/webapp/User.controller.js';
import landingPageRoutes from '#routes/webapp/leads.route.js';
import roomRoutes from '#routes/webapp/Room.controller.js';
import requestRoutes from '#routes/webapp/Request.controller.js';
import hotelRoutes from '#routes/webapp/Hotel.controller.js';
import imageRoutes from '#routes/webapp/Image.controller.js';

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

// // Cache
// import { warmCache as warmDevicesCache } from '#libs/Device.cache.js';
// import { warmCache as warmIntentsCache } from '#libs/Intent.cache.js';

// Admin Routes
import adminHotelRoutes from '#routes/admin/Hotel.controller.js';
import adminStaffRoutes from '#routes/admin/Staff.controller.js';
import DDB from '#clients/DynamoDb.client.js';
import { ENTITY_TABLE_NAME } from '#Constants/DB.constants.js';
import { ActiveRequestStatuses, InActiveRequestStatuses } from '#Constants/statuses.js';

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
    origin: ['http://localhost:3000', 'https://app.roommitra.com'],
  })
);

// UI routes
app.use('/requests', authenticator, requestRoutes);
app.use('/booking', authenticator, bookingRoutes);
app.use('/rooms', authenticator, roomRoutes);
app.use('/staff', authenticator, staffRoutes);
app.use('/hotel', authenticator, hotelRoutes);
app.use('/image', authenticator, imageRoutes);

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
app.use('/leads', landingPageRoutes);

// -------------------------
// Admin Routes
// -------------------------
app.use('/admin/hotels', adminAuthenticator, adminHotelRoutes);
app.use('/admin/staff', adminAuthenticator, adminStaffRoutes);

/**
 * Helper: pick the key from an item.
 * Adjust if your PKs are named differently.
 */
function getKey(item) {
  if (item.pk && item.sk) return { pk: item.pk, sk: item.sk };
  if (item.id) return { id: item.id };
  throw new Error('Cannot determine key: expected pk/sk or id on item');
}

/**
 * Helper: build an UpdateExpression from a plain object like { fieldA: 123, fieldB: 'x' }
 */
function buildUpdateExpression(fields) {
  const names = {};
  const values = {};
  const sets = [];

  let i = 0;
  for (const [k, v] of Object.entries(fields)) {
    i++;
    const nk = `#f${i}`;
    const vk = `:v${i}`;
    names[nk] = k;
    values[vk] = v;
    sets.push(`${nk} = ${vk}`);
  }

  if (sets.length === 0) return null;

  return {
    UpdateExpression: `SET ${sets.join(', ')}`,
    ExpressionAttributeNames: names,
    ExpressionAttributeValues: values,
  };
}

/**
 * Scans all items (optionally filtered) and applies per-item updates.
 * @param {Object} opts
 * @param {string} opts.tableName
 * @param {(item)=> (null|Object)} opts.computeFields A function that returns an object of fields to SET, or null to skip item.
 * @param {string} [opts.filterExpression] Optional Scan filter (reduces updates you don’t need)
 * @param {Object} [opts.expressionAttributeValues]
 * @param {Object} [opts.expressionAttributeNames]
 * @param {number} [opts.concurrency] Number of parallel updates (default 5)
 */
async function updateAllRequests({
  hotelId,
  tableName = ENTITY_TABLE_NAME,
  computeFields,
  concurrency = 5,
}) {
  if (typeof computeFields !== 'function') {
    throw new Error('computeFields(item) is required');
  }

  let lastEvaluatedKey;
  let updated = 0;

  do {
    const scanParams = {
      TableName: tableName,
      ExclusiveStartKey: lastEvaluatedKey,
      KeyConditionExpression: 'pk = :pk and begins_with(sk, :sk)',
      ExpressionAttributeValues: {
        ':pk': `HOTEL#${hotelId}`,
        ':sk': 'REQUEST#',
      },
      // If you have entity-type marking, you can filter here (saves write calls):
      // FilterExpression: "entityType = :req",
      // ExpressionAttributeValues: { ":req": "REQUEST" },
    };

    const page = await DDB.query(scanParams).promise();
    const items = page.Items || [];

    // Small concurrency pool
    const queue = [];
    for (const item of items) {
      const fieldsToSet = computeFields(item);
      if (!fieldsToSet || Object.keys(fieldsToSet).length === 0) continue;

      const upd = buildUpdateExpression(fieldsToSet);
      if (!upd) continue;

      const params = {
        TableName: tableName,
        Key: getKey(item),
        ...upd,
      };

      // run with limited parallelism
      const work = DDB.update(params)
        .promise()
        .then(() => (updated += 1));
      queue.push(work);

      if (queue.length >= concurrency) {
        await Promise.race(queue).catch(() => {}); // prevent unhandled rejections
        // remove settled promises
        for (let i = queue.length - 1; i >= 0; i--) {
          if (queue[i].isFulfilled || queue[i].isRejected) queue.splice(i, 1);
        }
      }
    }

    // drain remaining
    await Promise.allSettled(queue);

    lastEvaluatedKey = page.LastEvaluatedKey;
  } while (lastEvaluatedKey);

  console.log(`✅ Updated ${updated} items in ${tableName}`);
}

/* =======================
   Example usages
   ======================= */

app.use(
  '/update-req-status',
  express.Router().get('/:hotelId', async (req, res) => {
    const { hotelId } = req.params;

    updateAllRequests({
      hotelId,
      computeFields: (item) => {
        const statusType = ActiveRequestStatuses.includes(item.status)
          ? 'ACTIVE'
          : InActiveRequestStatuses.includes(item.status)
            ? 'INACTIVE'
            : 'UNKNOWN';
        return { status_pk: `REQSTATUS#${statusType}#HOTEL#${item.hotelId}` };
      },
    });

    return res.status(200).json({ message: 'hi' });
  })
);

app.listen(PORT, () => console.log(`Server running on port: http://localhost:${PORT}`));

// run functions on server startup
// warmDevicesCache();
// warmIntentsCache();

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
