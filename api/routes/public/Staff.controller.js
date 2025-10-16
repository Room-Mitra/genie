import { registerStaff, getStaffDetails } from '#services/Staff.service.js';

import express from 'express';
const router = express.Router();

// register all staff
router.post('/', async (req, res) => {
  const allStaff = req.body;
  const { hotelId } = req.userData;
  const response = await registerStaff(allStaff, hotelId);
  const successMessage = `${JSON.stringify(allStaff)} : has been added to the Database for hotelid ${hotelId}`;
  console.log(successMessage, response);
  res.send(successMessage);
});

router.get('/', async (req, res) => {
  const { hotelId } = req.userData;
  console.log('Looking up Staff Details for id = ' + hotelId);
  const staffData = await getStaffDetails(hotelId);
  console.log(`For Hotel - ${hotelId} - Staff Data :: ${JSON.stringify(staffData)}`);
  res.send(staffData);
});

// // get guest details
// router.get('/:staffId', async (req, res) => {
//     const staffId = req.params.staffId;
//     console.log("Looking up Guest Details for id = " + staffId);
//     const staffData = await getStaffDetails(staffId)
//     console.log(`Guest Data :: ${JSON.stringify(staffData)}`)
//     res.send(staffData)
// })

// // update guest data
// router.put('/:staffId', async (req, res) => {
//     const staffId = +req.params.staffId;
//     await updateStaffData(staffId, req.body)
//     res.send("Updated successfully");
// })

// // delete staff
// router.delete('/:staffId', async (req, res) => {
//     const staffId = +req.params.staffId;
//     await deleteStaffData(staffId);
//     res.send("Deleted successfully");
// })

export default router;
