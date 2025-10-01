import express from 'express';
const router = express.Router();
import { getHotelId } from '../../common/services/common.service.js';

import {
  registerStaffRoomDepartmentMapping,
  getStaffRoomDepartmentMappings,
} from './StaffRoomDepartmentRequestMapping.service.js';

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

export default router;
