const express = require('express');
const { registerIntent, getIntentsForDate } = require('./Intent.service');
const router = express.Router();

// register intent
router.post('/', async (req, res) => {
    const intent = req.body;
    await registerIntent(intent)
    res.send(`${JSON.stringify(intent)} has been added to the Database`);
})

router.get('/:dateAsInteger', async (req, res) => {
    const dateAsInteger = +req.params.dateAsInteger;
    console.log("/intents/" + dateAsInteger)
    const intents = await getIntentsForDate(dateAsInteger)
    res.send(intents)
})


module.exports = router;
