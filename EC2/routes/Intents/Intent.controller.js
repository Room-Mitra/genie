const express = require('express');
const { registerIntent, getIntentsForDateRange } = require('./Intent.service');
const router = express.Router();

// register intent
router.post('/', async (req, res) => {
    const intent = req.body;
    await registerIntent(intent)
    res.send(`${JSON.stringify(intent)} has been added to the Database`);
})

router.get('/:dateAsInteger', async (req, res) => {
    const dateAsInteger = +req.params.dateAsInteger;
    const range = +(req.query.range || 0);
    const intents = await getIntentsForDateRange(dateAsInteger, range)
    res.send(intents)
})


module.exports = router;
