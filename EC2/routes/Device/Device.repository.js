const { DEVICES_TABLE_NAME } = require("../../Constants/DB.constants.js");
const DDB = require("../../config/DynamoDb.config.js");
// const ID_TYPE = "DEVICE:";
// const addIdType = (device) => {
//     device.deviceId = `${ID_TYPE}${device.deviceId}`;
//     return device;
// }


// const removeIdType = (device) => {
//     device.deviceId = device.deviceId.slice(ID_TYPE.length);
//     return device;
// }

const registerNewDevice = async (device) => {
    const params = {
        TableName: DEVICES_TABLE_NAME,
        Item: { ...device },

    };

    const res = await DDB.put(params).promise();// TODO :: Handle Error
    console.log("res :: ", res)
    return params.Item;
};

const getAllDevices = async () => {
    const params = {
        TableName: DEVICES_TABLE_NAME,
    };

    const devices = await DDB.scan(params).promise();// TODO :: Handle Error
    console.log(devices);
    return devices.Items;
};

const updateDevice = async (device) => {
    const params = {
        TableName: DEVICES_TABLE_NAME,
        Item: { ...device },

    };

    await DDB.put(params).promise(); // TODO :: Handle Error
    return params.Item;
}

const updateMultipleDevices = async (devices) => {
    const updatedDeviceData = [];
    devices.forEach(async (device) => {
        const updatedData = await updateDevice(device)
        updatedDeviceData.push(updatedData)
    });
    return updatedDeviceData;

}

module.exports = {
    registerNewDevice,
    getAllDevices,
    updateMultipleDevices
};