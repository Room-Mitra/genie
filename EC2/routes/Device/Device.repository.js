const DDB = require("../../config/DynamoDb.config.js");

const registerNewDevice = async (device) => {
    const params = {
        TableName: "Devices",
        Item: {
            deviceId: device.deviceId,
            roomId: device.roomId,
            roomInfo: device.roomInfo,
            deviceInfo: device.deviceInfo,
        },
    };

    await DDB.put(params).promise();

    return params.Item;
};

module.exports = { registerNewDevice };