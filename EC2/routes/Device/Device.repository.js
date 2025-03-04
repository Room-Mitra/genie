const { DEVICES_TABLE_NAME } = require("../../Constants/DB.constants.js");
const DDB = require("../../config/DynamoDb.config.js");

const registerNewDevice = async (device) => {
    const params = {
        TableName: DEVICES_TABLE_NAME,
        Item: {
            ...device
            // deviceId: device.deviceId,
            // roomId: device.roomId,
            // propertyName: device.propertyName,
            // floor: device.floor,
            // room: device.room,
            // roomTags: device.roomTags,
            // roomNotes: device.roomNotes,
            // deviceType: device.deviceType,
            // deviceTags: device.deviceTags,
            // deviceNotes: device.deviceNotes,
            // registeredAtUTC: device.registeredAtUTC
        },

    };

    await DDB.put(params).promise();
    return params.Item;
};

const getAllDevices = async () => {
    const params = {
        TableName: DEVICES_TABLE_NAME,
    };

    const devices = await DDB.scan(params).promise();
    console.log(devices);
    return devices.Items;
};

module.exports = {
    registerNewDevice,
    getAllDevices
};