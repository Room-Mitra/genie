const { registerNewDevice: addDeviceToCache, getDevices: getAllDevicesFromCache, updateMultipleDevices: updateCache, getDevices } = require("./Device.cache.js")
const { registerNewDevice: addDeviceToDB, updateMultipleDevices: updateDB } = require("./Device.repository.js")

const registerDevice = async (deviceDetails) => {

    addDeviceToCache(deviceDetails);
    addDeviceToDB(deviceDetails);

}

const getAllDevices = () => {
    console.log(getAllDevicesFromCache())
    return getAllDevicesFromCache();
}

const updatedDevices = async (updatedDevicesData) => {
    updateCache(updatedDevicesData);
    updateDB(updatedDevicesData)
}

const getRoomIdFromDeviceId = (deviceId) => {
    // TODO :: update to get all room info, like room floor, not just rood number
    const allDevices = getDevices();
    const deviceIndex = allDevices.findIndex((device) => device.deviceId === deviceId);
    if (deviceIndex === -1) {
        throw new Error("Invalid Device")
    }
    return allDevices[deviceIndex].roomId;

}

module.exports = { registerDevice, getAllDevices, updatedDevices, getRoomIdFromDeviceId };