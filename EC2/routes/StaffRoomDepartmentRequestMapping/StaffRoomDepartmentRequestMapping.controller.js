const express = require('express');
const router = express.Router();
const { getHotelId } = require('../../common/services/common.service.js');

const { registerStaffRoomDepartmentMapping, getStaffRoomDepartmentMappings } = require('./StaffRoomDepartmentRequestMapping.service.js');

router.get('/', async (req, res) => {
    const hotelId = getHotelId(req);
    const mappings = await getStaffRoomDepartmentMappings(hotelId);
    res.send(mappings);
});

router.post('/', async (req, res) => {
    const hotelId = getHotelId(req);
    const mapping = req.body;
    await registerStaffRoomDepartmentMapping(hotelId, mapping);
    res.send(`${JSON.stringify(mapping)} : has been added to the Database`);
});

module.exports = router;