import express from 'express';
const router = express.Router();

/*const devices = [
    {
        id: 1, //PK
        deviceType: "Echo",
        roomId: "302",
        location: {
            propertyName: "Vivanta Mysore",
            floor: "3",
            room: "302",
            roomTags: ["Deluxe", "sea facing"]
        },
        deviceTags: ["abc", "def"]
    }
];*/

const devices = [];

// register device
router.post('/', (req, res) => {
    const device = req.body;
    devices.push({ ...device });
    res.send(`${JSON.stringify(device)} has been added to the Database`);
})


// load devices from DB to memory on restart
// hard refresh data to memory

// get all devices
router.get('/', (req, res) => {
    res.send(devices);
})


// get device details by id
// get device details by room number
// find devices in room
// find devices in property
// find devices in floor
// find devices by roomType/room tags
// find devices by tag
// get room details by room number

export default router;