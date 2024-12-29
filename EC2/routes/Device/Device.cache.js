const ALL_DEVICES = [];  // get all devices from DB

const registerNewDevice = (device) => {
    ALL_DEVICES.push(device);
};

const getDevices = () => {
    return ALL_DEVICES;
};

module.exports = { registerNewDevice, getDevices };

