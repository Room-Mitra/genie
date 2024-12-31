const { registerNewDevice: addDeviceToCache, getDevices: getAllDevicesFromCache } = require("./Device.cache.js")
const { registerNewDevice: addDeviceToDB } = require("./Device.repository.js")

const registerDevice = async (deviceDetails) => {

    addDeviceToCache(deviceDetails);
    addDeviceToDB(deviceDetails);

}

const getAllDevices = () => {
    console.log(getAllDevicesFromCache())
    return getAllDevicesFromCache();
}

module.exports = { registerDevice, getAllDevices };