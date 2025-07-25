const express = require('express');
const router = express.Router();
const { getHotelId } = require('../../common/services/common.service.js');
const { onUtterance, handleAdministrativeUtterances } = require('./Utterance.service.js');
const { getRoomInfoFromDeviceId } = require('../Device/Device.service.js');



router.post('/', async (req, res) => {
    try {
        const { userQuery, sessionId, deviceId } = req.body;
        const isAdministrativeUtterance = handleAdministrativeUtterances({ userQuery, sessionId, deviceId })
        if (!isAdministrativeUtterance) {
            const { hotelId } = getRoomInfoFromDeviceId(deviceId);
            console.log("New incoming utterance logged :: ", { userQuery, sessionId, deviceId, hotelId });
            const { speech, isSessionOpen } = await onUtterance(userQuery, hotelId, deviceId, sessionId)
            console.log({ speech, isSessionOpen })
            res.send({ speech, isSessionOpen });
        } else {
            res.send({
                speech: "Administrative task successfully completed",
                isSessionOpen: false
            });
        }

    } catch (error) {
        console.error('Error processing utterance:', error);
        res.status(500).send('Failed to process utterance');
    }
})


module.exports = router;
