const { registerStaff, getStaffDetails, updateStaffData, deleteStaffData } = require('./Staff.service.js');
const express = require('express');
const router = express.Router();



// register guest
router.post('/', async (req, res) => {
    const guest = req.body;
    await registerStaff(guest);
    res.send(`${JSON.stringify(guest)} : has been added to the Database`);
})
// get guest details
router.get('/:staffId', async (req, res) => {
    const staffId = req.params.staffId;
    console.log("Looking up Guest Details for id = " + staffId);
    const staffData = await getStaffDetails(staffId)
    console.log(`Guest Data :: ${JSON.stringify(staffData)}`)
    res.send(staffData)
})


// update guest data
router.put('/:staffId', async (req, res) => {
    const staffId = +req.params.staffId;
    await updateStaffData(staffId, req.body)
    res.send("Updated successfully");
})

// delete staff
router.delete('/:staffId', async (req, res) => {
    const staffId = +req.params.staffId;
    await deleteStaffData(staffId);
    res.send("Deleted successfully");
})


module.exports = router;