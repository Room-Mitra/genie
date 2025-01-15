const ALL_DEVICES = [];  // get all devices from DB

const registerNewDevice = (device) => {
    const deviceId = device.deviceId;
    const deviceIndex = ALL_DEVICES.findIndex((device) => device.deviceId === deviceId);
    console.log("deviceIndex", deviceIndex);
    if (deviceIndex !== -1) {
        ALL_DEVICES.splice(deviceIndex, 1);
    }

    ALL_DEVICES.push(device);
};

const getDevices = () => {
    return ALL_DEVICES;
};

module.exports = { registerNewDevice, getDevices };
