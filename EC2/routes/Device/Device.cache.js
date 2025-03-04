const { getAllDevices: fetchAllDevicesFromRepository } = require("./Device.repository.js")

let ALL_DEVICES = [];  // get all devices from DB

const warmCache = async () => {
    const devices = await fetchAllDevicesFromRepository();
    ALL_DEVICES = [...devices];
    console.log("DEVICES CACHE HAS BEEN WARMED  :  ", JSON.stringify(ALL_DEVICES));
};

const registerNewDevice = (device) => {
    removeDeviceIfExists(device)
    addDeviceToCache(device)
};

const removeDeviceIfExists = (device) => {
    const deviceId = device.deviceId;
    const deviceIndex = ALL_DEVICES.findIndex((device) => device.deviceId === deviceId);

    if (deviceIndex !== -1) {
        ALL_DEVICES.splice(deviceIndex, 1);
    }
}

const addDeviceToCache = (device) => {
    ALL_DEVICES.push(device);
}

const updateDevice = (device) => {
    removeDeviceIfExists(device)
    addDeviceToCache(device)
}

const updateMultipleDevices = (devices) => {
    devices.forEach(device => updateDevice(device));
}

const getDevices = () => {
    return ALL_DEVICES;
};

module.exports = { registerNewDevice, getDevices, updateMultipleDevices, warmCache };
