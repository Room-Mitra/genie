const express = require('express');
const { registerIntent } = require('./Intent.service');
const router = express.Router();

// register intent
router.post('/', async (req, res) => {
    const intent = req.body;
    await registerIntent(intent)
    res.send(`${JSON.stringify(intent)} has been added to the Database`);
})

module.exports = router;
