import { registerIntent, getIntentsForDateRange } from './Intent.service.js';
import express from 'express';
const router = express.Router();

// register intent
router.post('/', async (req, res) => {
  const intent = req.body;
  await registerIntent(intent);
  console.log('Intent Data :: ', intent, 'added to repo');
  res.send(`${JSON.stringify(intent)} has been added to the Database`);
});

router.get('/:dateAsInteger', async (req, res) => {
  const dateAsInteger = +req.params.dateAsInteger;
  const range = +(req.query.range || 0);
  try {
    const intents = await getIntentsForDateRange(dateAsInteger, range);
    res.send(intents);
  } catch (e) {
    // update this with proper error handling
    res.status(500).send(e);
  }
});

export default router;
