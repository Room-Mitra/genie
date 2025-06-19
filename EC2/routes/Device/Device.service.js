const { registerNewDevice: addDeviceToCache, getDevices: getAllDevicesFromCache, updateMultipleDevices: updateCache, getDevices } = require("./Device.cache.js")
const { registerNewDevice: addDeviceToDB, updateMultipleDevices: updateDB } = require("./Device.repository.js")

const registerDevice = async (deviceDetails) => {
    console.log(deviceDetails, " ::   deviceDetails")
    addDeviceToCache(deviceDetails);
    addDeviceToDB(deviceDetails);

}

const getAllDevices = () => {
    console.log(getAllDevicesFromCache())
    return getAllDevicesFromCache();
}

const updateDevices = async (updatedDevicesData) => {
    updateCache(updatedDevicesData);
    updateDB(updatedDevicesData)
}

const getRoomInfoFromDeviceId = (deviceId) => {

    const allDevices = getDevices();
    const deviceIndex = allDevices.findIndex((device) => device.deviceId === deviceId);
    if (deviceIndex === -1) {
        throw new Error("Invalid Device")
    }
    return {
        roomId: allDevices[deviceIndex].roomId,
        propertyName: allDevices[deviceIndex].propertyName,
        floor: allDevices[deviceIndex].floor,
        roomTags: allDevices[deviceIndex].roomTags,
        roomNotes: allDevices[deviceIndex].roomNotes
    };

}

const addBookingToRoom = async (roomId, bookingId) => {
    const [deviceInfo] = getAllDevices().filter((device) => device.roomId === roomId)
    deviceInfo["currentBooking"] = bookingId;
    console.log(deviceInfo, "++++++++++++++DEVICE INFO++++++++++++")
    updateDevices([deviceInfo])

}

module.exports = { registerDevice, getAllDevices, updateDevices, getRoomInfoFromDeviceId, addBookingToRoom };