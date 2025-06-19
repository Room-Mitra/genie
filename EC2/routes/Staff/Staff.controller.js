const { getHotelId } = require('../../common/services/common.service.js');
const { registerStaff,
    getStaffDetails,
    // updateStaffData, deleteStaffData 
} = require('./Staff.service.js');
const express = require('express');
const router = express.Router();



// register all staff
router.post('/', async (req, res) => {
    const allStaff = req.body;
    const hotelId = getHotelId(req);
    const response = await registerStaff(allStaff, hotelId);
    const successMessage = `${JSON.stringify(allStaff)} : has been added to the Database for hotelid ${hotelId} `;
    console.log(successMessage, response)
    res.send(successMessage);
})

router.get('/', async (req, res) => {
    const hotelId = getHotelId(req);
    console.log("Looking up Staff Details for id  = " + hotelId);
    const staffData = await getStaffDetails(hotelId)
    console.log(`For Hotel - ${hotelId} - Staff Data :: ${JSON.stringify(staffData)}`)
    res.send(staffData)
})


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


module.exports = router;