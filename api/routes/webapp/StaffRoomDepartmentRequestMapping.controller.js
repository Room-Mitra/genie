import express from 'express';
const router = express.Router();

import {
  registerStaffRoomDepartmentMapping,
  getStaffRoomDepartmentMappings,
} from '#services/StaffRoomDepartmentRequestMapping.service.js';

router.get('/', async (req, res) => {
  const { hotelId } = req.userData;
  const mappings = await getStaffRoomDepartmentMappings(hotelId);
  res.send(mappings);
});

router.post('/', async (req, res) => {
  const { hotelId } = req.userData;
  const mapping = req.body;
  await registerStaffRoomDepartmentMapping(hotelId, mapping);
  res.send(`${JSON.stringify(mapping)} : has been added to the Database`);
});

export default router;
