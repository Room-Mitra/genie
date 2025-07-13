const express = require('express');
const router = express.Router();
const { getHotelId } = require('../../common/services/common.service.js');
const { onUtterance } = require('./Utterance.service.js');



router.post('/', async (req, res) => {
    const { userQuery, sessionId, deviceId } = req.body;
    const hotelId = getHotelId(req);
    console.log("New incoming utterance logged :: ", { userQuery, sessionId, deviceId, hotelId })
    const { speech, isSessionOpen } = await onUtterance(userQuery, hotelId, deviceId, sessionId)
    console.log({ speech, isSessionOpen })
    res.send({ speech, isSessionOpen });

})


module.exports = router;
