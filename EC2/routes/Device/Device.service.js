const { registerNewDevice: addDeviceToCache, getDevices: getAllDevicesFromCache, updateMultipleDevices: updateCache } = require("./Device.cache.js")
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

module.exports = { registerDevice, getAllDevices, updatedDevices };